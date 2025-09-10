import { gql } from "apollo-server-express";

const rootTypeDefs = gql`
  type Query
  type Mutation
`;

export default rootTypeDefs;
