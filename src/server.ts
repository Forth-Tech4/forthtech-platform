import express from "express";
import { ApolloServer } from "apollo-server-express";
import mongoose from "mongoose";
import schema from "./schema/schema";
import cors from "cors";

const startServer = async () => {
  const app: any = express();
  // ✅ Allow all origins (no need to declare frontend URL)
  app.use(
    cors({
      origin: "*", // allows all domains
      credentials: true, // allow cookies/auth headers
    })
  );

  const server = new ApolloServer({
    schema,
  });

  await server.start();
  server.applyMiddleware({ app });

  await mongoose.connect("mongodb://localhost:27017/forthtech_platForm");

  app.listen(4000, () => {
    console.log(
      `🚀 Server running at http://localhost:4000${server.graphqlPath}`
    );
  });
};

startServer();
