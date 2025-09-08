import { gql } from "apollo-server-express";

const typeDefs = gql`
  type Category {
    id: ID!
    name: String!
    description: String
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

  type Index {
    id: ID!
    name: String!
    description: String
    categoryId: ID!
    category: Category
  }

  type IndexResponse {
    success: Boolean!
    message: String
    error: String
    data: Index
  }

  type IndexListResponse {
    success: Boolean!
    message: String
    error: String
    data: [Index]
  }

  type Course {
    id: ID!
    title: String!
    description: String
    indexId: ID!
  }

  type CourseResponse {
    success: Boolean!
    message: String
    error: String
    data: Course
  }

  type CourseListResponse {
    success: Boolean!
    message: String
    error: String
    data: [Course]
  }
  type Exercise {
    question: String!
    hint: String
    solution: String
  }

  type Quiz {
    question: String!
    options: [String!]!
    answer: String!
  }

  type SectionContent {
    markdown: String!
    exercises: [Exercise]
    quizzes: [Quiz]
  }

  type Section {
    id: ID!
    courseId: ID!
    title: String!
    content: SectionContent!
  }

  type SectionResponse {
    success: Boolean!
    message: String
    error: String
    data: Section
  }

  type SectionListResponse {
    success: Boolean!
    message: String
    error: String
    data: [Section]
  }

  type Query {
    categories: CategoryListResponse
    category(id: ID!): CategoryResponse
    indexesByCategory(categoryId: ID!): IndexListResponse
    index(id: ID!): IndexResponse # ✅ new get-by-id query
    courses: CourseListResponse
    course(id: ID!): CourseResponse
    coursesByIndex(indexId: ID!): CourseListResponse
    sectionsByCourse(courseId: ID!): SectionListResponse
    section(id: ID!): SectionResponse
  }

  type Mutation {
    createCategory(name: String!, description: String): CategoryResponse
    updateCategory(id: ID!, name: String, description: String): CategoryResponse
    deleteCategory(id: ID!): CategoryResponse
    createIndex(
      name: String!
      description: String
      categoryId: ID!
    ): IndexResponse
    updateIndex(
      id: ID!
      name: String
      description: String
      categoryId: ID
    ): IndexResponse
    deleteIndex(id: ID!): IndexResponse
    createCourse(
      title: String!
      description: String
      indexId: ID!
    ): CourseResponse

    updateCourse(
      id: ID!
      title: String
      description: String
      indexId: ID
    ): CourseResponse

    deleteCourse(id: ID!): CourseResponse
    createSection(
      courseId: ID!
      title: String!
      markdown: String!
      exercises: [ExerciseInput]
      quizzes: [QuizInput]
    ): SectionResponse

    updateSection(
      id: ID!
      title: String
      markdown: String
      exercises: [ExerciseInput]
      quizzes: [QuizInput]
    ): SectionResponse

    deleteSection(id: ID!): SectionResponse
  }
  input ExerciseInput {
    question: String!
    hint: String
    solution: String
  }

  input QuizInput {
    question: String!
    options: [String!]!
    answer: String!
  }
`;

export default typeDefs;
