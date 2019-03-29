/* eslint-disable global-require */

const winston = require('winston')
require('winston-mongodb')

module.exports = (config) => {
  const transports = []
  if (config.logTransportConsoleAllow) {
    transports.push(new winston.transports.Console())
  }
  if (config.logTransportMongoAllow) {
    transports.push(new winston.transports.MongoDB({
      db: config.mongoLogConnStr,
      collection: config.logTransportMongoCollection,
      tryReconnect: true,
      decolorize: true,
    }))
  }

  // NOTE: do not colorize logs in production, because winston-mongodb
  // inserts `level` field into DB with colorization
  const formats = (config.logFormatList || []).map(logFormat => {
    switch(logFormat) {
      case 'colorize':
        return winston.format.colorize()
      case 'simple':
        return winston.format.simple()
      case 'json':
        return winston.format.json()
      default:
        throw new Error(`logger: unknown format ${logFormat}`)
    }
  })

  const logger = winston.createLogger({
    level: config.logLevel,
    format: winston.format.combine(...formats),
    transports,
    levels: winston.config.npm.levels,
  })

  const createLogStream = level => ({
    write: (message) => {
      logger[level](message)
    },
  })

  logger.infoStream = createLogStream('info')

  return logger
}
