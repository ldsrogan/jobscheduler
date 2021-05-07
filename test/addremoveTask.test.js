/* eslint-disable no-undef */

import 'cross-fetch/polyfill';
import ApolloClient, { gql } from 'apollo-boost';
import { print } from 'graphql/language/printer';
import axios from 'axios';
import logger from '../library/logger';

test('Add/Remove Task GraphQL', async () => {
  const client = new ApolloClient({
    uri: 'http://localhost:6555/graphql',
  });

  const mutation = gql`
    mutation addTask($task: TaskInput!) {
      addTask(task: $task) {
        command
        type
      }
    }
  `;
  const taskQuery = gql`
    query taskCounts($queueName: String!) {
      waiting
      active
      completed
      failed
      delayed
    }
  `;

  const result = await client.mutate({
    mutation,
    variables: {
      task: {
        processName: 'graphqlTesting',
        command: 'GraphQLTaskCounts',
        type: 'graphql',
        url: 'localhost:6555', // server url which will receive the command
        api: print(taskQuery),
        method: 'query', // GET POST ... for REST APIs
        variables: { queueName: 'graphqlTesting' },
        priority: 1,
        repeat: {
          cron: '* 1 * * *',
        },
      },
    },
  });

  const task = result.data.addTask;
  expect(task.command).toBe('GraphQLTaskCounts');
  expect(task.type).toBe('graphql');

  /**
   *  Remove Task GraphQL
   */

  const removeMutation = gql`
    mutation emptyQueue($queueName: String!) {
      emptyQueue(queueName: $queueName)
    }
  `;

  const removeReesult = await client.mutate({
    mutation: removeMutation,
    variables: {
      queueName: 'graphqlTesting',
    },
  });

  const taskResult = removeReesult.data.emptyQueue;
  expect(taskResult).toBe(true);
});

test('Add/Remove Task REST', async () => {
  const task = {
    processName: 'restTesting',
    command: 'RESTTaskCounts',
    type: 'rest',
    url: 'localhost:6555', // server url which will receive the command
    api: 'addTask',
    method: 'POST', // GET POST ... for REST APIs
    variables: { queueName: 'restTesting' },
    priority: 1,
    repeat: { cron: '* 1 * * *' },
  };

  const result = await axios.post(`http://${task.url}/${task.api}`, {
    params: {
      task,
    },
  });

  const addedTask = result.data;
  expect(addedTask.command).toBe('RESTTaskCounts');
  expect(addedTask.type).toBe('rest');

  /**
   *  Remove Task REST
   */

  const job = {
    url: 'localhost:6555', // server url which will receive the command
    api: 'emptyQueue',
    method: 'POST', // GET POST ... for REST APIs
    variables: { queueName: 'restTesting' },
  };

  const removeResult = await axios.post(`http://${job.url}/${job.api}`, {
    params: job.variables,
  });

  const { data } = removeResult;
  expect(data).toBe(true);
});
