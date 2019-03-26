/* eslint-disable global-require */

module.exports = {
  authenticate: require('./authenticate/authenticate'),
  isApiAuthenticated: require('./authenticate/isApiAuthenticated'),
  validateBody: require('./validate/validateBody'),
  validateQuery: require('./validate/validateQuery'),
  validateParams: require('./validate/validateParams'),
}
