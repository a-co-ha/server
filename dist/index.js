"use strict";

var _apolloServer = require("apollo-server");
var _templateObject;
function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
var typeDefs = (0, _apolloServer.gql)(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n  type Query {\n    text: String\n    hello: String\n  }\n"])));
var server = new _apolloServer.ApolloServer({
  typeDefs: typeDefs
});
server.listen({
  port: 3000
}).then(function (_ref) {
  var url = _ref.url;
  console.log("Running on ".concat(url));
});