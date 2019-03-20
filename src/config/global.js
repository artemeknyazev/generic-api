/* eslint-disable no-process-env */

module.exports = {
  httpAllow: true, // HTTP is always allowed
  // GENERIC_API_HTTP_PORT is either unset or contains Number in String
  httpPort: parseInt(process.env.GENERIC_API_HTTP_PORT, 10) || 8080,
  // GENERIC_API_HTTPS_ALLOW is either unset or contains String "0"|"1"
  httpsAllow: process.env.GENERIC_API_HTTPS_ALLOW !== undefined ?
    !!parseInt(process.env.GENERIC_API_HTTPS_ALLOW) : false,
  // GENERIC_API_HTTPS_PORT is either unset or contains Number in String
  httpsPort: parseInt(process.env.GENERIC_API_HTTPS_PORT, 10) || 8081,
  httpsKeyPath: process.env.GENERIC_API_HTTPS_KEY_PATH,
  httpsCertPath: process.env.GENERIC_API_HTTPS_CERT_PATH,
  httpsPassPath: process.env.GENERIC_API_HTTPS_PASS_PATH,
}
