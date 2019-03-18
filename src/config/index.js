/* eslint-disable no-process-env */

const ENV_DEVELOPMENT = 'development'
const ENV_TESTING = 'testing'
const ENV_PRODUCTION = 'production'

const DEFAULT_PORT = 8080
const TESTING_PORT = 8001

const {
  NODE_ENV,
  GENERIC_API_PORT,
} = process.env

const env = NODE_ENV || ENV_DEVELOPMENT

const isDevelopment = env === ENV_DEVELOPMENT
const isTesting = env === ENV_TESTING
const isProduction = env === ENV_PRODUCTION

let port = GENERIC_API_PORT || DEFAULT_PORT
if (isTesting) {
  port = TESTING_PORT
}

module.exports = {
  env,
  port,
  isDevelopment,
  isTesting,
  isProduction,
}
