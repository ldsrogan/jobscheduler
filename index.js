import dotenv from 'dotenv';
import logger from 'library/logger';
import runServer from './server';

dotenv.config({ path: './config/.env' });
// Run Server First
runServer();
