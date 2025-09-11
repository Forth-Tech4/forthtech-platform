import express from "express";
import { ApolloServer } from "apollo-server-express";
import mongoose from "mongoose";
import schema from "./schema/schema";
import cors from "cors";
import path from "path";
import uploadRouter from "./services/fileUpload"; // path to uploads.ts
import { verifyAccessToken } from "./graphql/authResolver";


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
    context: ({ req }) => {
      // Get the token from the request headers
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      let user = null;
      if (token) {
        try {
          user = verifyAccessToken(token);
        } catch (error) {
          // Token is invalid or expired, user remains null
          console.log('Invalid token:', error instanceof Error ? error.message : 'Unknown error');
        }
      }
      
      return { user };
    },
  });
// Serve static files
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Use the upload router
app.use("/", uploadRouter);

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
