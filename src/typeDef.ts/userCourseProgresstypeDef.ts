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

type UserProgressData {
  totalSections: Int!
  completedSections: Int!
  completedSectionsID: [String!]!
}

  type UserProgressListResponse {
    success: Boolean!
    message: String
    error: String
    data: UserProgressData
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