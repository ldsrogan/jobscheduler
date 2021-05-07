import logger from 'library/logger';
import { exist, getQueue } from '../factory';

const taskCounts = async (queueName) => {
  if (exist(queueName)) {
    const queue = getQueue(queueName);
    const result = await queue.getJobCounts();
    return result;
  }

  throw new Error(
    `Queue named ${queueName} doesn't exist! Please check your queueName and try again.`,
  );
};

export { taskCounts };
