import Queue from 'bull';
import dotenv from 'dotenv';
import { setQueues } from 'bull-board';
import logger from 'library/logger';

dotenv.config({ path: './config/.env' });

let redisUrl = null;
let redisPort = null;

if (process.env.REDIS_URL) {
  redisUrl = process.env.REDIS_URL;
  redisPort = process.env.REDIS_PORT;
}

const opts = {
  redis: {
    port: redisPort,
    host: redisUrl,
  },
};

/** Handler Examples */

const handleFailure = (job, err) => {
  if (job.attemptsMade >= job.opts.attempts) {
    logger.error(
      `Job failures above threshold in ${job.queue.name} for: ${JSON.stringify(
        job.data,
      )}`,
      err,
    );
    job.remove();
    return null;
  }
  logger.error(
    `Job in ${job.queue.name} failed for: ${JSON.stringify(job.data)} with ${
      err.message
    }. ${job.opts.attempts - job.attemptsMade} attempts left`,
  );
  return null;
};

const handleCleaned = (jobs, type) => {
  logger.info(`Cleaned ${jobs.length} ${type} jobs`);
};

// const handleCompleted = (job) => {
//   logger.info(
//     `Job in ${job.queue.name} completed for: ${JSON.stringify(job.data)}`,
//   );
//   job.remove();
// };

// const handleStalled = (job) => {
//   logger.info(
//     `Job in ${job.queue.name} stalled for: ${JSON.stringify(job.data)}`,
//   );
// };

const queues = {};

const getQueue = (name) => {
  const queue = name in queues ? queues[name] : new Queue(name, opts);
  queues[name] = queue;

  /** Handler Examples */
  queue.on('failed', handleFailure);
  queue.on('cleaned', handleCleaned);
  // queue.on('completed', handleCompleted);
  // queue.on('stalled', handleStalled);

  setQueues(Object.values(queues));
  return queue;
};

const exist = (name) => {
  return name in queues;
};

export { exist, getQueue };
