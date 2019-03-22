/* eslint-disable global-require */

// NOTE:
//   * Logger is a persistent entity that is initialized before an app
//   * We can't sensibly pass a logger inside route handlers or other
//   middlelewares, so we use it as a global object
//   * However, we're still shutting down a logger manually on an app
//   shutdown. This is because MongoDB transport's connection to db
//   persists and we need to shut it down manually
//   * Also, we don't shut down logger during tests because we're
//   creating and shutting down the app multiple times while keeping
//   the same logger

const winston = require('winston')
// TODO: rewrite using custom transport that uses mongoose
// NOTE: this will fix 'no way to wait until logger.close' problem
require('winston-mongodb')
const config = require('../config')

const transports = []
if (config.logConsoleAllow) {
  transports.push(new winston.transports.Console())
}
if (config.logMongoAllow) {
  transports.push(new winston.transports.MongoDB({
    db: config.mongoLogConnStr,
    collection: config.logMongoCollection,
    tryReconnect: true,
    decolorize: true,
  }))
}

const logger = winston.createLogger({
  level: config.logLevel,
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
