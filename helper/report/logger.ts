const winston = require('winston');

/**
 * Creates a named Winston logger that writes to console and logs/test.log
 * @param {string} module - Label shown in every log line
 * @returns {winston.Logger}
 */
function createLogger(module) {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] [${level.toUpperCase()}] [${module}]: ${message}`;
      })
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'logs/test.log' })
    ]
  });
}

module.exports = { createLogger };
