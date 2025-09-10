import { gql } from "apollo-server-express";

const categoryTypeDefs = gql`
  type Category {
    id: ID!
    name: String!
    description: String
    indexes: [Index]
  }

  type CategoryResponse {
    success: Boolean!
    message: String
    error: String
    data: Category
  }

  type CategoryListResponse {
    success: Boolean!
    message: String
    error: String
    data: [Category]
  }

  extend type Query {
    categories: CategoryListResponse
    category(id: ID!): CategoryResponse
  }

  extend type Mutation {
    createCategory(name: String!, description: String): CategoryResponse
    updateCategory(id: ID!, name: String, description: String): CategoryResponse
    deleteCategory(id: ID!): CategoryResponse
  }
`;

export default categoryTypeDefs;
