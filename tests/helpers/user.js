const {
  apiGet,
  apiPatch,
  apiDelete,
} = require('./api')

function createName() {
  return Date.now() + ' ' + Math.round(Math.random() * Number.MAX_SAFE_INTEGER)
}

function createEmail() {
  return `${Date.now() + '-' + Math.round(Math.random() * Number.MAX_SAFE_INTEGER)}@test.com`
}

function createPassword() {
  return Date.now().toString()
}

function getUser(server, token) {
  return apiGet(server, '/api/v1/user', token)
}

function patchUser(server, token, data = {}) {
  return apiPatch(server, '/api/v1/user', token, data)
}

function removeUser(server, token) {
  return apiDelete(server, '/api/v1/user', token)
}

module.exports = {
  createName,
  createEmail,
  createPassword,

  getUser,
  patchUser,
  removeUser,
}
