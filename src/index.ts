import compression from "compression";
import cors from "cors";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import {
  port,
  TYPEORM_CONNECTION,
  TYPEORM_HOST,
  TYPEORM_USERNAME,
  TYPEORM_PASSWORD,
  TYPEORM_DATABASE,
  TYPEORM_PORT,
  TYPEORM_SYNCHRONIZE,
  TYPEORM_LOGGING,
  TYPEORM_ENTITIES,
} from "./config";
import { DataSource } from "typeorm";
import resolvers from "./graphql/resolver";
import fs from "fs";

const typeDefs = fs.readFileSync("src/graphql/schema.graphql", {
  encoding: "utf-8",
});

const app = express();
app.use("*", cors());
app.use(compression());

let apolloServer: any = null;
async function startServer() {
  apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
}
startServer();

async function initialize() {
  try {
    const myDataSource = new DataSource({
      type: TYPEORM_CONNECTION as "mysql",
      host: TYPEORM_HOST,
      port: TYPEORM_PORT,
      username: TYPEORM_USERNAME,
      password: TYPEORM_PASSWORD,
      database: TYPEORM_DATABASE,
    });
    myDataSource.initialize().then(() => {
      console.log("Data Source has been initialized!");
    });
    console.log("DB Connected!");
  } catch (e) {
    console.log(e);
  }
}
initialize();

app.listen(port, () =>
  console.log(`🚀 http://localhost:${port}${apolloServer.graphqlPath}`)
);
