import express from 'express';
import session from 'express-session';
import process from 'process';
import cors from 'cors';
import { UI } from 'bull-board';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import logger from 'library/logger';
import * as mutate from './graphql/mutation';
import * as query from './graphql/query';

const app = express();
// bodyParser is needed just for POST
app.use(bodyParser.json(), cors());

app.use(helmet());
// setup morgan logger as middleware. for more log options, please see https://github.com/expressjs/morgan
app.use(
  morgan(
    ':remote-addr - ":method :url HTTP/:http-version" Status -:status cont-len -:res[content-length] ":referrer" - :response-time ms',
    {
      stream: logger.stream,
    },
  ),
);

app.set('trust proxy', 1); // trust first proxy

// for more information about settings for session, please visit
// https://www.npmjs.com/package/express-session
const sess = {
  secret: 'admin1', // temporally set as admin1, this needs to be changed for sure.
  resave: false,
  saveUninitialized: true,
  cookie: {},
};

/**
 * For using secure cookies in production, but allowing for testing in development
 * Later, you may want to setup cookie usage more secured. Please use https://www.npmjs.com/package/cookie-session
 *  */

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}

app.use(session(sess));

// Make bullboard available at the base app route
app.use('/admin', UI);

app.post('/addTask', async (req, res) => {
  const result = await mutate.addTask(req.body.params);

  return res.send(result);
});

app.post('/removeTask', async (req, res) => {
  const result = await mutate.removeTask(req.body.params);
  return res.send(result);
});

app.post('/emptyQueue', async (req, res) => {
  const result = await mutate.emptyQueue(req.body.params.queueName);
  return res.send(result);
});

app.get('/taskCounts', async (req, res) => {
  const result = await query.taskCounts(req.body.params);

  return res.send(result);
});

export default app;
