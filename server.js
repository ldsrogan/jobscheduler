import { ApolloServer, PubSub } from 'apollo-server-express';
import http from 'http';
import config from 'config';
import logger from 'library/logger';
import typeDefs from 'graphql/typedefs';
import resolvers from 'graphql/resolvers';
import app from './app';
import graphqlLogPlugin from './core/plugins/graphqllog';

const PORT = 6679;
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req, /* res, */ connection }) => {
    if (connection) {
      // check connection for metadata
      return connection.context;
    }
    // check from req
    const token = req.headers.authorization || '';
    return {
      token,
    };
  },
});

/**
 * This plugin is for graphQL log.
 * This config package can be use for both development and production levels.
 * You can add more config in the files to use in code.
 * Config files are located in config folder and the loading orders are
 *  default.json
    {deployment}.json
    local.json
    local-{deployment}.EXT
    (Finally, custom environment variables can override all files)
 *  Supported format: .yml, .yaml, .xml, .coffee, .cson, .properties, .json, .json5, .hjson, .ts, .js
 *  In this following examples include the same name config and one doesn't overwrite another because local.json
 *  will use only for local development, production.json is used only for the production level
 *  local.json
    {
    'dbUrl': 'mongodb://localhost:27017/mydb'
    }
    production.json
    {
    'dbUrl': 'mongodb://some-db-location/dbname'
    }
 */

if (config.get('graphQLLog')) {
  server.plugins = [graphqlLogPlugin];
}

// pubsub uses for GraphQL subscription
global.pubsub = new PubSub();

const runServer = async (port) => {
  server.applyMiddleware({ app });
  const httpServer = http.createServer(app);
  server.installSubscriptionHandlers(httpServer);

  let serverPort = PORT;

  if (typeof port !== 'undefined') {
    serverPort = port;
  }

  httpServer.listen(serverPort, () => {
    logger.info(
      `Scheduler is ready at http://localhost:${serverPort}${server.graphqlPath}`,
    );
  });

  return httpServer;
};

export default runServer;
