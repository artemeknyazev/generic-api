/* eslint-disable no-process-env */
const parent = require('./global')

module.exports = {
  ...parent,

  // Heroku rolls it's own HTTPS
  httpsAllow: false,
  // Heroku provides port number
  httpPort: parseInt(process.env.PORT, 10),

  logFormatList: [ 'json' ],
  // Allow Mongo logs
  logTransportMongoAllow: true,
  logTransportMongoCollection: 'generic-api-production',
}
