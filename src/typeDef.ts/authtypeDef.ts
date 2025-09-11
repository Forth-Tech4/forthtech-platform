import { gql } from 'apollo-server-express';

export const authTypeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String!
    role: String!
    createdAt: String!
    updatedAt: String!
  }

  type SignUpPayload {
    user: User!
    success: Boolean!
    message: String!
  }

  type LoginPayload {
    user: User!
    accessToken: String!
    refreshToken: String!
    expiresIn: Int!
    expiresAt: String!
    success: Boolean!
    message: String!
  }

  type RefreshTokenPayload {
    accessToken: String!
    refreshToken: String!
    success: Boolean!
    message: String!
  }

  type LogoutPayload {
    success: Boolean!
    message: String!
  }

  type ErrorDetail {
    field: String
    message: String!
  }

  type ValidationError {
    message: String!
    errors: [ErrorDetail!]!
  }

  input SignUpInput {
    email: String!
    password: String!
    name: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input RefreshTokenInput {
    refreshToken: String!
  }

  type Query {
    me: User
  }

  type Mutation {
    signUp(input: SignUpInput!): SignUpPayload!
    login(input: LoginInput!): LoginPayload!
    refreshToken(input: RefreshTokenInput!): RefreshTokenPayload!
    logout: LogoutPayload!
  }
`;
