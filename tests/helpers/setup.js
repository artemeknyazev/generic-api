const request = require('supertest')
const {
  createEmail,
  createPassword,
} = require('./user')
const {
  createProjectTitle,
  createProject,
} = require('./project')

function signup(server, email = createEmail(), password = createPassword(), data = {}) {
  return request(server)
    .post('/api/v1/signup')
    .send({ email, password, ...data })
}

function login(server, email = createEmail(), password = createPassword()) {
  return request(server)
    .post('/api/v1/login')
    .send({ email, password })
}

async function signupAndLogin(server, email = createEmail(), password = createPassword()) {
  await signup(server, email, password)
  const res = await login(server, email, password)
  return {
    id: res.body.payload.id,
    email,
    password,
    token: res.body.payload.token,
  }
}

async function setupProject(server) {
  const { id: ownerId, token: ownerToken } = await signupAndLogin(server)
  const { id: projectId } = await createProject(server, ownerToken)
  return { ownerToken, ownerId, projectId }
}

async function setupProjectWithParticipant(server) {
  const { id: participantId, token: participantToken } = await signupAndLogin(server)
  const { id: ownerId, token: ownerToken } = await signupAndLogin(server)
  const { id: projectId } = await createProject(
    server,
    ownerToken,
    { title: createProjectTitle(), participants: [ participantId ] }
  )
  return { ownerToken, ownerId, participantToken, participantId, projectId }
}

async function setupProjectWithParticipantAndOutsider(server) {
  const setupResult = await setupProjectWithParticipant(server)
  const { id: outsiderId, token: outsiderToken } = await signupAndLogin(server)
  return { ...setupResult, outsiderId, outsiderToken }
}

module.exports = {
  signup,
  login,
  signupAndLogin,

  setupProject,
  setupProjectWithParticipant,
  setupProjectWithParticipantAndOutsider,
}
