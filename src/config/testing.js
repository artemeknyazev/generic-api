const parent = require('./global')

module.exports = {
  ...parent,
  // Prevent conflicts on dev machine with running dev server
  httpPort: 8001,
  httpsPort: 8002,
  logLevel: 'debug',
  // Disable mongo logs for now
  logMongoAllow: false,
  logMongoCollection: 'generic-api-staging',
  // During tests app is created and shut down multiple times
  // but logger should persist
  logCloseOnShutdown: false
}
