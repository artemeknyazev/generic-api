/* eslint-disable no-process-env */

// TODO: add checks for undefined required env vars

module.exports = {
  // 1. HTTP/HTTPS
  httpAllow: true, // HTTP is always allowed
  // GENERIC_API_HTTP_PORT is either unset or contains Number in String
  httpPort: parseInt(process.env.GENERIC_API_HTTP_PORT, 10) || 8080,
  // GENERIC_API_HTTPS_ALLOW is either unset or contains String "0"|"1"
  httpsAllow: process.env.GENERIC_API_HTTPS_ALLOW !== undefined
    ? !!parseInt(process.env.GENERIC_API_HTTPS_ALLOW) : false,
  // GENERIC_API_HTTPS_PORT is either unset or contains Number in String
  httpsPort: parseInt(process.env.GENERIC_API_HTTPS_PORT, 10) || 8081,
  httpsKeyPath: process.env.GENERIC_API_HTTPS_KEY_PATH,
  httpsCertPath: process.env.GENERIC_API_HTTPS_CERT_PATH,
  httpsPassPath: process.env.GENERIC_API_HTTPS_PASS_PATH,

  // 2. Databases
  mongoMainConnStr: process.env.GENERIC_API_MONGO_DB,
  mongoMainReconnectTries: 10,
  mongoMainReconnectInterval: 1000,
  mongoLogConnStr: process.env.GENERIC_API_LOG_MONGO_DB,

  // 3. Logging
  logLevel: 'warn',
  logFormatList: [ 'colorize', 'simple' ],
  logTransportConsoleAllow: true,
  logTransportMongoAllow: false,
  logTransportMongoCollection: '',

  // 4. Shutdown
  // Process will unconditionally exit after this time when shutdown is scheduled
  shutdownForceExitTime: process.env.GENERIC_API_SHUTDOWN_FORCE_EXIT_TIME || 20,

  // 5. Auth
  authJwtPrivateKey: process.env.GENERIC_API_AUTH_JWT_PRIVATE_KEY,
}
