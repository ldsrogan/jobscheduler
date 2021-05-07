import '@babel/register';
import '@babel/polyfill/noConflict';

import runServer from '../../server';
// Global setup for testing. This is always called when tests start.
export default async () => {
  // init testing server
  global.testingSever = await runServer(6555);
};
