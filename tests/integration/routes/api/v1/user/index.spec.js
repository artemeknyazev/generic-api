const request = require('supertest')
const { signupAndLogin } = require('tests/helpers/setup')
const {
  createName,
  getUser,
  patchUser,
  removeUser,
} = require('tests/helpers/user')

describe('/api/v1/user', () => {
  // --- Integration tests preamble start --
  let server = null
  let shutdown = null
  beforeEach((done) => {
    const config = require('src/config')
    const bootstrap = require('src/bootstrap')
    bootstrap(config).then(result => {
      server = result.testServer
      shutdown = result.shutdown
      done()
    })
  })
  afterEach((done) => {
    shutdown().then(() => done())
  })
  // --- Integration tests preamble end --

  it('Can\'t access current user info without log in', async () => {
    const res = await request(server)
      .get('/api/v1/user')
      .send()
    expect(res.status).toBe(401)
    expect(res.body.status).toBe('error')
  })

  it('Can access current user info after sign up and log in', async () => {
    const { id, email, token } = await signupAndLogin(server)
    const res = await getUser(server, token)
    expect(res.statusCode).toBe(200)
    expect(res.status).toBe('ok')
    expect(res.payload).toEqual({ id, email })
  })

  it('Can change current user info after log in', async () => {
    const { token } = await signupAndLogin(server)
    const patchData = { name: createName() }
    const res = await patchUser(server, token, patchData)
    expect(res.statusCode).toBe(200)
    expect(res.status).toBe('ok')
    expect(res.payload).toMatchObject({ ...patchData })
  })

  it('User info change persists', async () => {
    const { token } = await signupAndLogin(server)
    const patchData = { name: createName() }
    await patchUser(server, token, patchData)
    const res = await getUser(server, token)
    expect(res.statusCode).toBe(200)
    expect(res.status).toBe('ok')
    expect(res.payload).toMatchObject(patchData)
  })

  it('Can remove own user after log in', async () => {
    const { token } = await signupAndLogin(server)
    const res = await removeUser(server, token)
    expect(res.statusCode).toBe(204)
  })

  it('Can\'t access user info when using removed user credentials', async () => {
    const { token } = await signupAndLogin(server)
    await removeUser(server, token)
    const res = await getUser(server, token)
    expect(res.statusCode).toBe(401)
    expect(res.status).toBe('error')
  })
})
