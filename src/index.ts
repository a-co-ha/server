import compression from "compression";
import cors from "cors";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { port } from "./config";
import resolvers from "./graphql/resolver";
import fs from "fs";

const typeDefs = fs.readFileSync("src/graphql/schema.graphql", {
  encoding: "utf-8",
});

const app = express();
app.use("*", cors());
app.use(compression());

// const typeDefs = `
//     type Query{
//         totalPosts: Int!
//     }
// `;
// const resolvers = {
//   Query: {
//     totalPosts: () => 100,
//   },
// };
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

app.listen(port, () =>
  console.log(`🚀 http://localhost:${port}${apolloServer.graphqlPath}`)
);
