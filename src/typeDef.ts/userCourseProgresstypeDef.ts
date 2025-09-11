import { gql } from "apollo-server-express";

const userCourseProgressTypeDefs = gql`
  type UserProgress {
    id: ID!
    userId: ID!
    courseId: ID!
    completedSections: [String!]!
  }

  type UserProgressResponse {
    success: Boolean!
    message: String
    error: String
    data: UserProgress
  }

  type UserProgressListResponse {
    success: Boolean!
    message: String
    error: String
    data: [String!]!
  }

  extend type Query {
    getUserProgress(userId: ID!, courseId: ID!): UserProgressListResponse
  }

  extend type Mutation {
    markSectionComplete(userId: ID!, courseId: ID!, sectionId: String!): UserProgressResponse
    unmarkSectionComplete(userId: ID!, courseId: ID!, sectionId: String!): UserProgressResponse
  }
`;

export default userCourseProgressTypeDefs;