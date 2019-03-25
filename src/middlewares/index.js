/* eslint-disable global-require */

module.exports = {
  authenticate: require('./authenticate'),
  validateBody: require('./validate/validateBody'),
  validateQuery: require('./validate/validateQuery'),
  validateParams: require('./validate/validateParams'),
}
