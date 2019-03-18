const winston = require('winston')
const {
  isDevelopment,
  isTesting,
} = require('../config')

const transports = []
if (isDevelopment || isTesting) {
  transports.push(new winston.transports.Console())
}

const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'warn',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.splat(),
    winston.format.simple()
  ),
  transports,
  levels: winston.config.npm.levels,
})

const createLogStream = level => ({
  write: (message) => {
    logger[level](message)
  },
})

module.exports = {
  logger,
  httpRequestStream: createLogStream('info'),
}
