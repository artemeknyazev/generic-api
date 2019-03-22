/* eslint-disable no-process-env */
const parent = require('./global')

module.exports = {
  ...parent,
  // Heroku rolls it's own HTTPS
  httpsAllow: false,
  // Heroku provides port number
  httpPort: parseInt(process.env.PORT, 10),
  // Allow Mongo logs
  logMongoAllow: true,
  logMongoCollection: 'generic-api-production',
}
