/* eslint-disable global-require */

module.exports = {
  'login': require('./login'),
  'signup': require('./signup'),
  'create-project': require('./project/create'),
  'patch-project': require('./project/patch'),
  'create-task': require('./task/create'),
  'patch-task': require('./task/patch'),
  'patch-user': require('./user/patch'),
}
