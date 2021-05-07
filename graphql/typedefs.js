import { gql } from 'apollo-server';

/**
 *  currently, Mutation and Subscription are not defined here, so printer.typedf.js includes those definition
 *  If there is any common Subscription or Mutation that needs to be added in here, then you should add extend before
 *  type Mutation or type Subscription in printer.typedef.js
 */
const typeDefs = gql`
  scalar JSON

  type Query {
    taskCounts(queueName: String!): TaskCounts!
  }

  type Mutation {
    addTask(task: TaskInput!): Task!
    removeTask(queueName: String!, grace: Int!, status: String!): Boolean!
    emptyQueue(queueName: String!): Boolean!
  }

  type Task {
    id: ID!
    command: String!
    type: String!
    api: String!
  }

  type TaskCounts {
    waiting: Int!
    active: Int!
    completed: Int!
    failed: Int!
    delayed: Int!
  }

  input TaskInput {
    processName: String!
    command: String!
    type: String!
    url: String!
    api: String!
    method: String!
    variables: JSON!
    priority: Int!
    repeat: JSON
  }
`;

export default typeDefs;
