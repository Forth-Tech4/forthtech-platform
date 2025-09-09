// import { makeExecutableSchema } from "@graphql-tools/schema";
// import typeDefs from "../graphql/typeDefs";
// import {categoryResolver} from "../graphql/categoryResolver";
// import { indexResolver } from "../graphql/indexesResolver";
// import { courseResolver } from "../graphql/courseResolver";
// import { courseSectionResolver } from "../graphql/courseSectionResolver";
// const schema = makeExecutableSchema({
//   typeDefs,
//   resolvers: [categoryResolver,indexResolver,courseResolver,courseSectionResolver],
// });

// export default schema;
import { makeExecutableSchema } from "@graphql-tools/schema";
import rootTypeDefs from "../typeDef.ts/roottypeDef";
import categoryTypeDefs from "../typeDef.ts/categorytypeDef";
import indexTypeDefs from "../typeDef.ts/indextypeDef";
import courseTypeDefs from "../typeDef.ts/coursetypeDef";
import courseSectionTypeDefs from "../typeDef.ts/courseSectiontypeDef";
import {categoryResolver} from "../graphql/categoryResolver";
import { indexResolver } from "../graphql/indexesResolver";
import { courseResolver } from "../graphql/courseResolver";
import { courseSectionResolver } from "../graphql/courseSectionResolver";

const schema = makeExecutableSchema({
  typeDefs: [
    rootTypeDefs,
    categoryTypeDefs,
    indexTypeDefs,
    courseTypeDefs,
    courseSectionTypeDefs,
  ],
  resolvers: [
    categoryResolver,
    indexResolver,
    courseResolver,
    courseSectionResolver,
  ],
});

export default schema;
