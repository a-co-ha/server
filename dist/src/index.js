"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var apollo_server_1 = require("apollo-server");
var typeDefs = (0, apollo_server_1.gql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  type Query {\n    text: String\n    hello: String\n  }\n"], ["\n  type Query {\n    text: String\n    hello: String\n  }\n"])));
var server = new apollo_server_1.ApolloServer({ typeDefs: typeDefs });
server.listen({ port: 3000 }).then(function (_a) {
    var url = _a.url;
    console.log("Running on ".concat(url));
});
var templateObject_1;
