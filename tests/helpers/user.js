const request = require('supertest')

function createSuffix() {
  return Date.now() + '-' + Math.round(Math.random() * Number.MAX_SAFE_INTEGER)
}

function createEmail() {
  return `${createSuffix()}@test.com`
}

function createPassword() {
  return Date.now().toString()
}

function createName() {
  return Date.now() + ' ' + Date.now()
}

function signup(
  server,
  email = createEmail(),
  password = createPassword(),
) {
  return request(server)
    .post('/api/v1/signup')
    .send({ email, password })
}

function login(
  server,
  email = createEmail(),
  password = createPassword(),
) {
  return request(server)
    .post('/api/v1/login')
    .send({ email, password })
}

async function signupAndLogin(
  server,
  email = createEmail(),
  password = createPassword(),
) {
  await signup(server, email, password)
  const res = await login(server, email, password)
  return {
    email,
    password,
    token: res.body.payload.token,
  }
}

function get(
  server,
  token,
) {
  return request(server)
    .get('/api/v1/user')
    .set('x-generic-api-auth-token', token)
    .send()
}

function patch(
  server,
  token,
  data = {},
) {
  return request(server)
    .patch('/api/v1/user')
    .set('x-generic-api-auth-token', token)
    .send(data)
}

function remove(
  server,
  token,
) {
  return request(server)
    .delete('/api/v1/user')
    .set('x-generic-api-auth-token', token)
    .send()
}

module.exports = {
  createName,
  createEmail,
  createPassword,
  signup,
  login,
  signupAndLogin,
  get,
  patch,
  remove,
}