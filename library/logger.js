/*
default log level 
{ 
  crit: 0, error: 1, warn: 2, info: 3, notice: 4, debug: 5, http: 6 
}
*/

import winston from 'winston';
import 'winston-daily-rotate-file';
import chalk from 'chalk';
import stringify from 'json-stringify-safe';
import appRoot from 'app-root-path';
import process from 'process';

const { format } = winston;

// because coloring in winston is not working (not sure why) so removed all coloring characters
// and use chalk package to recolor texts
const pureText = (text) => {
  return text.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    '',
  );
};
// Custom coloring each level
const colorPicker = (levelStr) => {
  const resultStr = pureText(levelStr);
  if (resultStr === 'CRIT') {
    return chalk.red.bold(resultStr);
  }
  if (resultStr === 'ERROR') {
    return chalk.redBright.bold(resultStr);
  }
  if (resultStr === 'WARN') {
    return chalk.yellow.bold(levelStr);
  }
  if (resultStr === 'INFO') {
    return chalk.blue.bold(resultStr);
  }
  if (resultStr === 'NOTICE') {
    return chalk.greenBright.bold(resultStr);
  }
  if (resultStr === 'DEBUG') {
    return chalk.green.bold(resultStr);
  }
  if (resultStr === 'HTTP') {
    return chalk.cyanBright.bold(resultStr);
  }
  return resultStr;
};
// define console log format
const logFormat = format.printf(({ level, message, label, timestamp }) => {
  return `${chalk.yellow(timestamp)} ${chalk.magenta(
    `[${label}]`,
  )} ${colorPicker(level.toUpperCase())}: ${
    typeof message !== 'string' ? stringify(message, null, 2) : message
  }`;
});
// define log file format
const logFileFormat = format.printf(({ level, message, label, timestamp }) => {
  return `${timestamp} ${`[${label}]`} ${level.toUpperCase()}: ${
    typeof message !== 'string' ? stringify(message, null, 2) : message
  }`;
});

const logDir = `${appRoot}/logs`;
const labelName = 'JOB SCHEDULER';

// define custom levels with colors (currently, somehow the color is not working, so I used chalk package to re-color)
const customLevels = {
  levels: {
    crit: 0,
    error: 1,
    warn: 2,
    info: 3,
    notice: 4,
    debug: 5,
    http: 6,
  },
  colors: {
    crit: 'bold red',
    error: 'bold red',
    warn: 'bold yellow',
    notice: 'bold green',
    info: 'bold blue',
    debug: 'bold green',
    http: 'bold cyan',
  },
};

// add custom color
winston.addColors(customLevels.colors);

// create logger
const logger = winston.createLogger({
  handleExceptions: true,
  exitOnError: false,
  levels: customLevels.levels,
  transports: [
    // daily rotate file allows to manage log files. this supports gzip
    new winston.transports.DailyRotateFile({
      level: 'http', // log level definition
      dirname: logDir,
      filename: '%DATE%-log.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      // format definitioin
      format: format.combine(
        format.label({ label: labelName }),
        format.timestamp(),
        logFileFormat,
      ),
    }),
  ],
});

// logger.add(
//   new winston.transports.DailyRotateFile({
//     level: 'info',
//     dirname: logDir,
//     filename: '%DATE%-http.log',
//     datePattern: 'YYYY-MM-DD',
//     handleExceptions: true,
//     format: format.combine(
//       format.label({ label: labelName }),
//       format.timestamp(),
//       logFileFormat,
//     ),
//   }),
// );

/**
 * In production level, console log will not be appeared.
 */
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      level: 'debug', // log level definition
      handleExceptions: true,
      // log format
      format: format.combine(
        format.label({ label: labelName }),
        format.timestamp(),
        logFormat,
      ),
    }),
  );
}

/**
 * This allows to catch the stream message (http request and response) to log
 */
logger.stream = {
  write(message /* encoding */) {
    logger.http(message);
  },
};

export default logger;
