# Authentication API Testing Guide for Postman

## Base URL
```
http://localhost:4000/graphql
```

## Headers for all requests
```
Content-Type: application/json
```

## Authentication Flow
**IMPORTANT:** Users MUST register first, then login, and only then can access the dashboard and manage content.

1. **Register** → 2. **Login** → 3. **Access Dashboard** → 4. **Manage Content (Protected)** → 5. **Refresh Tokens** → 6. **Logout**

## Protected Endpoints
The following endpoints require authentication (valid access token in Authorization header):
- All **Mutation** operations (create, update, delete) for:
  - Categories
  - Indexes  
  - Courses
  - Course Sections
- **Query** operations remain public (no authentication required)

## 1. Sign Up (User Registration)

### Request
**Method:** POST  
**URL:** `http://localhost:4000/graphql`

**Headers:**
```
Content-Type: application/json
```

**Body (GraphQL):**
```graphql
mutation {
  signUp(input: {
    email: "test@example.com"
    password: "password123"
    name: "Test User"
  }) {
    user {
      id
      email
      name
      role
      createdAt
      updatedAt
    }
    accessToken
    refreshToken
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "signUp": {
      "user": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "email": "test@example.com",
        "name": "Test User",
        "role": "user",
        "createdAt": "2023-09-06T10:30:00.000Z",
        "updatedAt": "2023-09-06T10:30:00.000Z"
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "success": true,
      "message": "Account created successfully! Welcome to our platform."
    }
  }
}
```

## 2. Login

### Request
**Method:** POST  
**URL:** `http://localhost:4000/graphql`

**Headers:**
```
Content-Type: application/json
```

**Body (GraphQL):**
```graphql
mutation {
  login(input: {
    email: "test@example.com"
    password: "password123"
  }) {
    user {
      id
      email
      name
      role
      createdAt
      updatedAt
    }
    accessToken
    refreshToken
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "login": {
      "user": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "email": "test@example.com",
        "name": "Test User",
        "role": "user",
        "createdAt": "2023-09-06T10:30:00.000Z",
        "updatedAt": "2023-09-06T10:30:00.000Z"
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "success": true,
      "message": "Login successful! Welcome back."
    }
  }
}
```

## 3. Get Current User (Protected Route)

### Request
**Method:** POST  
**URL:** `http://localhost:4000/graphql`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

**Body (GraphQL):**
```graphql
query {
  me {
    id
    email
    name
    role
    createdAt
    updatedAt
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "me": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "email": "test@example.com",
      "name": "Test User",
      "role": "user",
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

## 4. Refresh Token

### Request
**Method:** POST  
**URL:** `http://localhost:4000/graphql`

**Headers:**
```
Content-Type: application/json
```

**Body (GraphQL):**
```graphql
mutation {
  refreshToken(input: {
    refreshToken: "YOUR_REFRESH_TOKEN_HERE"
  }) {
    accessToken
    refreshToken
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "refreshToken": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "success": true,
      "message": "Tokens refreshed successfully."
    }
  }
}
```

## 5. Logout

### Request
**Method:** POST  
**URL:** `http://localhost:4000/graphql`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

**Body (GraphQL):**
```graphql
mutation {
  logout
}
```

**Expected Response:**
```json
{
  "data": {
    "logout": {
      "success": true,
      "message": "Logged out successfully. See you next time!"
    }
  }
}
```

## Testing Workflow

### Step 1: Sign Up
1. Use the sign up mutation
2. Save the `accessToken` and `refreshToken` from the response

### Step 2: Test Protected Route
1. Use the `me` query with the `accessToken` in Authorization header
2. Should return user information

### Step 3: Test Token Refresh
1. Use the `refreshToken` mutation with the saved refresh token
2. Save the new tokens from the response

### Step 4: Test Logout
1. Use the `logout` mutation with the `accessToken` in Authorization header
2. Should return `true`

### Step 5: Test Protected Endpoints

#### Test 5.1: Create Category Without Token (Should Fail)
**Request:**
```graphql
mutation {
  createCategory(name: "Test Category", description: "Test Description") {
    success
    message
    data {
      id
      name
      description
    }
  }
}
```
**Headers:** (No Authorization header)
**Expected Error:**
```json
{
  "errors": [
    {
      "message": "Authentication required. Please login to access this resource.",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

#### Test 5.2: Create Category With Valid Token (Should Succeed)
**Request:**
```graphql
mutation {
  createCategory(name: "Test Category", description: "Test Description") {
    success
    message
    data {
      id
      name
      description
    }
  }
}
```
**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```
**Expected Response:**
```json
{
  "data": {
    "createCategory": {
      "success": true,
      "message": "Category created successfully",
      "data": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "Test Category",
        "description": "Test Description"
      }
    }
  }
}
```

#### Test 5.3: Create Index With Valid Token
**Request:**
```graphql
mutation {
  createIndex(name: "Test Index", description: "Test Description", categoryId: "CATEGORY_ID_HERE") {
    success
    message
    data {
      id
      name
      description
      categoryId
    }
  }
}
```
**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

#### Test 5.4: Create Course With Valid Token
**Request:**
```graphql
mutation {
  createCourse(title: "Test Course", description: "Test Description", indexId: "INDEX_ID_HERE") {
    success
    message
    data {
      id
      title
      description
      indexId
    }
  }
}
```
**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

### Step 6: Verify Logout
1. Try to use the `me` query again with the same access token
2. Should return an authentication error

## Error Testing Scenarios

### 1. Registration Error Tests

#### Test 1.1: Invalid Email Format
**Request:**
```graphql
mutation {
  signUp(input: {
    email: "invalid-email"
    password: "password123"
    name: "Test User"
  }) {
    user { id email name }
    accessToken
    refreshToken
    success
    message
  }
}
```
**Expected Error:**
```json
{
  "errors": [
    {
      "message": "Please enter a valid email address.",
      "extensions": {
        "code": "BAD_USER_INPUT"
      }
    }
  ]
}
```

#### Test 1.2: Password Too Short
**Request:**
```graphql
mutation {
  signUp(input: {
    email: "test@example.com"
    password: "123"
    name: "Test User"
  }) {
    user { id email name }
    accessToken
    refreshToken
    success
    message
  }
}
```
**Expected Error:**
```json
{
  "errors": [
    {
      "message": "Password must be at least 6 characters long",
      "extensions": {
        "code": "BAD_USER_INPUT"
      }
    }
  ]
}
```

#### Test 1.3: Name Too Short
**Request:**
```graphql
mutation {
  signUp(input: {
    email: "test@example.com"
    password: "password123"
    name: "A"
  }) {
    user { id email name }
    accessToken
    refreshToken
    success
    message
  }
}
```
**Expected Error:**
```json
{
  "errors": [
    {
      "message": "Name must be at least 2 characters long",
      "extensions": {
        "code": "BAD_USER_INPUT"
      }
    }
  ]
}
```

#### Test 1.4: Missing Required Fields
**Request:**
```graphql
mutation {
  signUp(input: {
    email: "test@example.com"
    password: "password123"
  }) {
    user { id email name }
    accessToken
    refreshToken
    success
    message
  }
}
```
**Expected Error:**
```json
{
  "errors": [
    {
      "message": "All fields are required: email, password, and name.",
      "extensions": {
        "code": "BAD_USER_INPUT"
      }
    }
  ]
}
```

#### Test 1.5: Duplicate Email
**Request:** (After successful registration)
```graphql
mutation {
  signUp(input: {
    email: "test@example.com"
    password: "password123"
    name: "Test User"
  }) {
    user { id email name }
    accessToken
    refreshToken
    success
    message
  }
}
```
**Expected Error:**
```json
{
  "errors": [
    {
      "message": "An account with this email already exists. Please use a different email or try logging in.",
      "extensions": {
        "code": "BAD_USER_INPUT"
      }
    }
  ]
}
```

### 2. Login Error Tests

#### Test 2.1: Invalid Email Format
**Request:**
```graphql
mutation {
  login(input: {
    email: "invalid-email"
    password: "password123"
  }) {
    user { id email name }
    accessToken
    refreshToken
    success
    message
  }
}
```
**Expected Error:**
```json
{
  "errors": [
    {
      "message": "Please enter a valid email address.",
      "extensions": {
        "code": "BAD_USER_INPUT"
      }
    }
  ]
}
```

#### Test 2.2: Missing Fields
**Request:**
```graphql
mutation {
  login(input: {
    email: "test@example.com"
  }) {
    user { id email name }
    accessToken
    refreshToken
    success
    message
  }
}
```
**Expected Error:**
```json
{
  "errors": [
    {
      "message": "Both email and password are required.",
      "extensions": {
        "code": "BAD_USER_INPUT"
      }
    }
  ]
}
```

#### Test 2.3: Invalid Credentials (Wrong Email)
**Request:**
```graphql
mutation {
  login(input: {
    email: "wrong@example.com"
    password: "password123"
  }) {
    user { id email name }
    accessToken
    refreshToken
    success
    message
  }
}
```
**Expected Error:**
```json
{
  "errors": [
    {
      "message": "Invalid email or password. Please check your credentials and try again.",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

#### Test 2.4: Invalid Credentials (Wrong Password)
**Request:**
```graphql
mutation {
  login(input: {
    email: "test@example.com"
    password: "wrongpassword"
  }) {
    user { id email name }
    accessToken
    refreshToken
    success
    message
  }
}
```
**Expected Error:**
```json
{
  "errors": [
    {
      "message": "Invalid email or password. Please check your credentials and try again.",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

### 3. Authentication Error Tests

#### Test 3.1: Access Protected Route Without Token
**Request:**
```graphql
query {
  me {
    id
    email
    name
    role
  }
}
```
**Headers:** (No Authorization header)
**Expected Error:**
```json
{
  "errors": [
    {
      "message": "Authentication required. Please login to access your profile.",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

#### Test 3.2: Access Protected Route With Invalid Token
**Request:**
```graphql
query {
  me {
    id
    email
    name
    role
  }
}
```
**Headers:**
```
Authorization: Bearer invalid-token
```
**Expected Error:**
```json
{
  "errors": [
    {
      "message": "Invalid access token. Please login again.",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

#### Test 3.3: Access Protected Route With Expired Token
**Request:**
```graphql
query {
  me {
    id
    email
    name
    role
  }
}
```
**Headers:**
```
Authorization: Bearer expired-token
```
**Expected Error:**
```json
{
  "errors": [
    {
      "message": "Access token has expired. Please refresh your token.",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

### 4. Token Refresh Error Tests

#### Test 4.1: Missing Refresh Token
**Request:**
```graphql
mutation {
  refreshToken(input: {
    refreshToken: ""
  }) {
    accessToken
    refreshToken
    success
    message
  }
}
```
**Expected Error:**
```json
{
  "errors": [
    {
      "message": "Refresh token is required.",
      "extensions": {
        "code": "BAD_USER_INPUT"
      }
    }
  ]
}
```

#### Test 4.2: Invalid Refresh Token
**Request:**
```graphql
mutation {
  refreshToken(input: {
    refreshToken: "invalid-refresh-token"
  }) {
    accessToken
    refreshToken
    success
    message
  }
}
```
**Expected Error:**
```json
{
  "errors": [
    {
      "message": "Invalid refresh token. Please login again.",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

#### Test 4.3: Expired Refresh Token
**Request:**
```graphql
mutation {
  refreshToken(input: {
    refreshToken: "expired-refresh-token"
  }) {
    accessToken
    refreshToken
    success
    message
  }
}
```
**Expected Error:**
```json
{
  "errors": [
    {
      "message": "Refresh token has expired. Please login again.",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

### 5. Logout Error Tests

#### Test 5.1: Logout Without Token
**Request:**
```graphql
mutation {
  logout
}
```
**Headers:** (No Authorization header)
**Expected Error:**
```json
{
  "errors": [
    {
      "message": "You must be logged in to logout.",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

## Error Response Format

All error responses follow this format:
```json
{
  "errors": [
    {
      "message": "Human-readable error message",
      "extensions": {
        "code": "ERROR_CODE"
      }
    }
  ]
}
```

### Common Error Codes:
- `BAD_USER_INPUT`: Validation errors, missing fields, invalid format
- `UNAUTHENTICATED`: Authentication errors, invalid/expired tokens
- `FORBIDDEN`: Authorization errors, insufficient permissions

## Environment Variables (Optional)

You can set these environment variables to customize token expiration:

```env
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
ACCESS_TOKEN_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d
```

## Postman Collection Setup

1. Create a new collection called "Authentication API"
2. Create environment variables:
   - `baseUrl`: `http://localhost:4000/graphql`
   - `accessToken`: (will be set automatically)
   - `refreshToken`: (will be set automatically)
3. Use the environment variables in your requests
4. Set up pre-request scripts to automatically use tokens where needed

## Notes

- Access tokens expire in 15 minutes by default
- Refresh tokens expire in 7 days by default
- Always use the latest refresh token when refreshing
- The `me` query requires a valid access token
- All **Mutation** operations (create, update, delete) require authentication
- All **Query** operations (read) are public and don't require authentication
- Use `Authorization: Bearer <token>` header for protected endpoints

## Summary

✅ **Authentication System Complete:**
- User registration and login with JWT tokens
- Token refresh mechanism
- Protected endpoints for content management
- Comprehensive error handling
- Ready for production use

✅ **Protected Endpoints:**
- Category management (create, update, delete)
- Index management (create, update, delete)  
- Course management (create, update, delete)
- Course section management (create, update, delete)

✅ **Public Endpoints:**
- All query operations (categories, indexes, courses, sections)
- User registration and login
