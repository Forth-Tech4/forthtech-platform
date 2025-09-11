
import { makeExecutableSchema } from "@graphql-tools/schema";
import rootTypeDefs from "../typeDef.ts/roottypeDef";
import categoryTypeDefs from "../typeDef.ts/categorytypeDef";
import indexTypeDefs from "../typeDef.ts/indextypeDef";
import courseTypeDefs from "../typeDef.ts/coursetypeDef";
import courseSectionTypeDefs from "../typeDef.ts/courseSectiontypeDef";
import { authTypeDefs } from "../typeDef.ts/authtypeDef";
import {categoryResolver} from "../graphql/categoryResolver";
import { indexResolver } from "../graphql/indexesResolver";
import { courseResolver } from "../graphql/courseResolver";
import { courseSectionResolver } from "../graphql/courseSectionResolver";
import { authResolver } from "../graphql/authResolver";

const schema = makeExecutableSchema({
  typeDefs: [
    rootTypeDefs,
    categoryTypeDefs,
    indexTypeDefs,
    courseTypeDefs,
    courseSectionTypeDefs,
    authTypeDefs,
  ],
  resolvers: [
    categoryResolver,
    indexResolver,
    courseResolver,
    courseSectionResolver,
    authResolver,
  ],
});

export default schema;
