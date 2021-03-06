/* eslint-disable global-require */

module.exports = {
  acquireProject: require('./acquire/acquireProject'),
  acquireTask: require('./acquire/acquireTask'),
  apiResponse: require('./apiResponse'),
  authenticate: require('./authenticate/authenticate'),
  authorizeProjectEdit: require('./authorize/authorizeProjectEdit'),
  authorizeProjectView: require('./authorize/authorizeProjectView'),
  isApiAuthenticated: require('./authenticate/isApiAuthenticated'),
  validate: require('./validate'),
}
