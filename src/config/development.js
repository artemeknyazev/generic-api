const parent = require('./global')

module.exports = {
  ...parent,

  logLevel: 'debug',
  logTransportMongoAllow: true,
  logTransportMongoCollection: 'generic-api-development',
}
