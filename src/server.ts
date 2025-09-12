import express from "express";
import dotenv from "dotenv";
import { ApolloServer } from "apollo-server-express";
import mongoose from "mongoose";
import schema from "./schema/schema";
import cors from "cors";
import uploadRouter from "./services/fileUpload"; 
import { verifyAccessToken } from "./graphql/authResolver";
import editorRouter from "./services/editorRouter"
import bodyParser from "body-parser";

const startServer = async () => {
  dotenv.config();
  const app: any = express();
  app.use(
    cors({
      origin: "*", 
      credentials: true, 
    })
  );
  app.use(bodyParser.json());

  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      let user = null;
      if (token) {
        try {
          user = verifyAccessToken(token);
        } catch (error) {
          console.log('Invalid token:', error instanceof Error ? error.message : 'Unknown error');
        }
      }
      
      return { user };
    },
  });


// Use the upload router
app.use("/", uploadRouter);
app.use("/",editorRouter)
  await server.start();
  server.applyMiddleware({ app });
  // await mongoose.connect("mongodb://localhost:27017/forthtech_platForm");
  await mongoose.connect("mongodb+srv://vidhibarot255_db_user:q1zfzEWjM4qB696L@cluster0.b1wsjfo.mongodb.net/SchoolApp?retryWrites=true&w=majority");

  app.listen(4000, () => {
    console.log(
      `🚀 Server running at http://localhost:4000${server.graphqlPath}`
    );
  });
};

startServer();
