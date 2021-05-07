import gql from 'graphql-tag';
import ApolloClient from 'apollo-boost';
import fetch from 'node-fetch';
import axios from 'axios';
import logger from 'library/logger';
import { exist, getQueue } from '../factory';

const addTask = async (input) => {
  const {
    processName,
    command,
    type,
    url,
    api,
    method,
    priority,
    variables,
    repeat,
  } = input.task;
  const queue = getQueue(processName);
  const job = await queue.add(
    {
      command,
      type,
      url,
      api,
      variables,
      method,
    },
    { priority, repeat },
  );

  // run task
  queue.process(async (task) => {
    try {
      const { data } = task;
      logger.notice(`processing job for ${data.command}`);
      // send data and wait for the result from server

      let result = null;
      const apiType = data.type.toLowerCase();
      const apiMethod = data.method.toLowerCase();

      if (apiType !== 'graphql' && apiType !== 'rest') {
        throw new Error(
          `Wrong API type! Your type is ${apiType}, but type should be either graphql or rest`,
        );
      }

      if (apiType === 'graphql') {
        const client = new ApolloClient({
          uri: `http://${url}/graphql`,
          fetch,
        });

        if (apiMethod === 'mutation') {
          result = await client.mutate({
            mutation: gql`
              ${data.api}
            `,
            variables: data.variables,
          });
        } else {
          result = await client.query({
            query: gql`
              ${data.api}
            `,
            variables: data.variables,
          });
        }
      } else if (apiType === 'rest') {
        result = await axios({
          url: `https://${url}/${api}`,
          method: data.method,
          data: data.variables,
        });
      }

      if (!result) {
        throw new Error(`update Printer Info by id ${data.command} fails`);
      } else {
        logger.notice(`${data.command} : success`);
      }
    } catch (err) {
      throw new Error('Unhandled error in addTask', err);
    }
  });

  logger.info(`Job ${command} is added.`);

  return {
    id: job.id,
    command,
    type,
    url,
    method,
    api,
  };
};

const removeTask = async (queueName, grace, status) => {
  if (exist(queueName)) {
    const queue = getQueue(queueName);
    const result = await queue.clean(grace, status);
    return result.length > 0;
  }
  throw new Error(`${queueName} does not exist!!`);
};

const emptyQueue = async (queueName) => {
  if (exist(queueName)) {
    const queue = getQueue(queueName);
    const jobCounts = queue.getJobCounts();
    let totalCount = 0;
    Object.keys(jobCounts).forEach((key) => {
      queue.clean(0, key);
      totalCount += jobCounts[key];
    });

    const multi = queue.multi();
    multi.flushall();
    const result = await multi.exec();

    logger.info(`Queue ${queueName} is emptied.`);

    return result[0][1] === 'OK' && totalCount === 0;
  }
  throw new Error(`${queueName} does not exist!!`);
};

export { addTask, removeTask, emptyQueue };
