/* eslint-disable no-process-env,global-require */

const ENV_DEVELOPMENT = 'development'
const ENV_TESTING = 'testing'
const ENV_STAGING = 'staging'
const ENV_PRODUCTION = 'production'

const env = process.env.NODE_ENV || ENV_DEVELOPMENT
const isDevelopment = env === ENV_DEVELOPMENT
const isTesting = env === ENV_TESTING
const isStaging = env === ENV_STAGING
const isProduction = env === ENV_PRODUCTION

const envConfigs = {
  [ENV_DEVELOPMENT]: require('./development'),
  [ENV_TESTING]: require('./testing'),
  [ENV_STAGING]: require('./staging'),
  [ENV_PRODUCTION]: require('./production'),
}

if (!envConfigs.hasOwnProperty(env))
  throw new Error(`Unsupported environment ${env}`)

/**
 * @property {string}   env
 * @property {boolean}  isDevelopment
 * @property {boolean}  isTesting
 * @property {boolean}  isStaging
 * @property {boolean}  isProduction
 * @property {boolean}  httpAllow
 * @property {number}   httpPort
 * @property {boolean}  httpsAllow
 * @property {number}   httpsPort
 * @property {string}   httpsKeyPath
 * @property {string}   httpsCertPath
 * @property {string}   httpsPassPath
 */
module.exports = {
  ...envConfigs[env],
  env,
  isDevelopment,
  isTesting,
  isStaging,
  isProduction,
}
