import { makeExecutableSchema } from "@graphql-tools/schema";
import typeDefs from "../graphql/typeDefs";
import {categoryResolver} from "../graphql/categoryResolver";
import { indexResolver } from "../graphql/indexesResolver";
import { courseResolver } from "../graphql/courseResolver";
import { courseSectionResolver } from "../graphql/courseSectionResolver";
const schema = makeExecutableSchema({
  typeDefs,
  resolvers: [categoryResolver,indexResolver,courseResolver,courseSectionResolver],
});

export default schema;
