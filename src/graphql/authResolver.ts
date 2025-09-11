// @ts-nocheck
import { User } from '../models/user';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AuthenticationError, UserInputError, ForbiddenError } from 'apollo-server-express';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-production';
const ACCESS_TOKEN_EXPIRE = process.env.ACCESS_TOKEN_EXPIRE || '1d';
const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE || '7d';

// Helper function to generate tokens
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRE }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRE }
  );
  
  return { accessToken, refreshToken };
};

// Input validation helper
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  if (password.length > 128) {
    return { isValid: false, message: 'Password must be less than 128 characters' };
  }
  return { isValid: true };
};

const validateName = (name: string): { isValid: boolean; message?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: 'Name is required' };
  }
  if (name.trim().length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters long' };
  }
  if (name.trim().length > 50) {
    return { isValid: false, message: 'Name must be less than 50 characters' };
  }
  return { isValid: true };
};

// Helper function to verify access token
export const verifyAccessToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: string };
    if (decoded.type !== 'access') {
      throw new AuthenticationError('Invalid token type. Access token required.');
    }
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Access token has expired. Please refresh your token.');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid access token. Please login again.');
    } else {
      throw new AuthenticationError('Authentication failed. Please login again.');
    }
  }
};

// Helper function to verify refresh token
const verifyRefreshToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string; type: string };
    if (decoded.type !== 'refresh') {
      throw new AuthenticationError('Invalid token type. Refresh token required.');
    }
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Refresh token has expired. Please login again.');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid refresh token. Please login again.');
    } else {
      throw new AuthenticationError('Token verification failed. Please login again.');
    }
  }
};

export const authResolver = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      const user = context.user;
      if (!user) {
        throw new AuthenticationError('Authentication required. Please login to access your profile.');
      }
      
      try {
        const foundUser = await User.findById((user as any).userId).select('-password -refreshToken');
        if (!foundUser) {
          throw new AuthenticationError('User account not found. Please contact support.');
        }
        
        return foundUser;
      } catch (error) {
        if (error instanceof AuthenticationError) {
          throw error;
        }
        throw new AuthenticationError('Failed to retrieve user information. Please try again.');
      }
    },
  },

  Mutation: {
    signUp: async (_: any, { input }: { input: { email: string; password: string; name: string } }) => {
      const { email, password, name } = input;

      // Input validation
      if (!email || !password || !name) {
        throw new UserInputError('All fields are required: email, password, and name.');
      }

      // Validate email format
      if (!validateEmail(email)) {
        throw new UserInputError('Please enter a valid email address.');
      }

      // Validate password
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new UserInputError(passwordValidation.message!);
      }

      // Validate name
      const nameValidation = validateName(name);
      if (!nameValidation.isValid) {
        throw new UserInputError(nameValidation.message!);
      }

      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          throw new UserInputError('An account with this email already exists. Please use a different email or try logging in.');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = new User({
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          name: name.trim(),
          role: 'admin',
        });

        await user.save();

        return {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
          },
          success: true,
          message: 'Account created successfully! Please login to continue.',
        };
      } catch (error) {
        if (error instanceof UserInputError) {
          throw error;
        }
        throw new UserInputError('Failed to create account. Please try again later.');
      }
    },

    login: async (_: any, { input }: { input: { email: string; password: string } }) => {
      const { email, password } = input;

      // Input validation
      if (!email || !password) {
        throw new UserInputError('Both email and password are required.');
      }

      // Validate email format
      if (!validateEmail(email)) {
        throw new UserInputError('Please enter a valid email address.');
      }

      try {
        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
          throw new AuthenticationError('Invalid email or password. Please check your credentials and try again.');
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new AuthenticationError('Invalid email or password. Please check your credentials and try again.');
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens((user._id as any).toString());

        // Save refresh token to database
        user.refreshToken = refreshToken;
        await user.save();

        // Calculate expiry info for access token (1 day in seconds)
        const expiresIn = 24 * 60 * 60;
        const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

        return {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
          },
          accessToken,
          refreshToken,
          expiresIn,
          expiresAt,
          success: true,
          message: 'Login successful! Welcome back.',
        };
      } catch (error) {
        if (error instanceof UserInputError || error instanceof AuthenticationError) {
          throw error;
        }
        throw new AuthenticationError('Login failed. Please try again later.');
      }
    },

    refreshToken: async (_: any, { input }: { input: { refreshToken: string } }) => {
      const { refreshToken } = input;

      if (!refreshToken) {
        throw new UserInputError('Refresh token is required.');
      }

      try {
        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Find user and verify refresh token matches
        const user = await User.findById((decoded as any).userId);
        if (!user) {
          throw new AuthenticationError('User not found. Please login again.');
        }
        
        if (user.refreshToken !== refreshToken) {
          throw new AuthenticationError('Invalid refresh token. Please login again.');
        }

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = generateTokens((user._id as any).toString());

        // Update refresh token in database
        user.refreshToken = newRefreshToken;
        await user.save();

        return {
          accessToken,
          refreshToken: newRefreshToken,
          success: true,
          message: 'Tokens refreshed successfully.',
        };
      } catch (error) {
        if (error instanceof UserInputError || error instanceof AuthenticationError) {
          throw error;
        }
        throw new AuthenticationError('Token refresh failed. Please login again.');
      }
    },

    logout: async (_: any, __: any, context: any) => {
      const user = context.user;
      if (!user) {
        throw new AuthenticationError('You must be logged in to logout.');
      }

      try {
        // Clear refresh token from database
        await User.findByIdAndUpdate((user as any).userId, { refreshToken: null });
        return {
          success: true,
          message: 'Logged out successfully. See you next time!',
        };
      } catch (error) {
        throw new AuthenticationError('Logout failed. Please try again.');
      }
    },
  },
};