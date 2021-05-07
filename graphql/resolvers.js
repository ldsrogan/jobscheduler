import { GraphQLJSON } from 'graphql-type-json';

import logger from 'library/logger';

import * as mutate from './mutation';
import * as query from './query';
/**
 *  anything that is sharable from different services can be defined in here.
 */
const resolvers = {
  JSON: GraphQLJSON,

  Query: {
    taskCounts: (_, { queueName }) => {
      return query.taskCounts(queueName);
    },
  },

  Mutation: {
    addTask: async (_, data) => {
      const result = await mutate.addTask(data);
      return result;
    },
    removeTask: async (_, { queueName, grace, status }) => {
      const result = await mutate.removeTask(queueName, grace, status);
      return result;
    },
    emptyQueue: async (_, { queueName }) => {
      const result = await mutate.emptyQueue(queueName);
      return result;
    },
  },
};

export default resolvers;
