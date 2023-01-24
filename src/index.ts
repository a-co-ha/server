import { ApolloServer, gql } from "apollo-server";

const typeDefs = gql`
  type Query {
    text: String
    hello: String
  }
`;

const server = new ApolloServer({ typeDefs });

server.listen({ port: 3000 }).then(({ url }) => {
  console.log(`Running on ${url}`);
});
