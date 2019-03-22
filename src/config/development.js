const parent = require('./global')

module.exports = {
  ...parent,
  logLevel: 'debug',
  logMongoAllow: true,
  logMongoCollection: 'generic-api-development',
}
