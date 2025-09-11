import { AuthenticationError } from 'apollo-server-express';
import { verifyAccessToken } from '../graphql/authResolver';

// Auth middleware to check if user is authenticated
export const requireAuth = (context: any) => {
  const user = context.user;
  
  if (!user) {
    throw new AuthenticationError('Authentication required. Please login to access this resource.');
  }
  
  return user;
};

// Auth middleware to check if user is admin
export const requireAdmin = (context: any) => {
  const user = requireAuth(context);
  
  if (user.role !== 'admin') {
    throw new AuthenticationError('Admin access required. You do not have permission to perform this action.');
  }
  
  return user;
};

// Helper function to get user from context (optional auth)
export const getCurrentUser = (context: any) => {
  return context.user || null;
};

// Middleware wrapper for resolvers
export const withAuth = (resolver: Function) => {
  return (parent: any, args: any, context: any, info: any) => {
    requireAuth(context);
    return resolver(parent, args, context, info);
  };
};

// Middleware wrapper for admin-only resolvers
export const withAdminAuth = (resolver: Function) => {
  return (parent: any, args: any, context: any, info: any) => {
    requireAdmin(context);
    return resolver(parent, args, context, info);
  };
};
