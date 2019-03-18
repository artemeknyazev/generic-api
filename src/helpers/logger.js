const winston = require('winston')
const { isDevelopment } = require('../config')

const transports = []
transports.push(new winston.transports.Console())

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

logger.infoStream = createLogStream('info')

module.exports = logger
