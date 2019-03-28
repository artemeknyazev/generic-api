const request = require('supertest')
const {
  createEmail,
  createPassword,
  login,
  signup,
} = require('tests/helpers/user')

describe('/api/v1/login', () => {
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

  it('Can\'t log in with empty data', async () => {
    const res = await request(server)
      .post('/api/v1/login')
      .send({})
    expect(res.status).toBe(400)
    expect(res.body.status).toBe('error')
  })

  it('Can\'t log in with email only as non-existent user', async () => {
    const email = createEmail()
    const res = await request(server)
      .post('/api/v1/login')
      .send({ email })
    expect(res.status).toBe(400)
    expect(res.body.status).toBe('error')
  })

  it('Can\'t log in with password only as non-existent user', async () => {
    const password = createPassword()
    const res = await request(server)
      .post('/api/v1/login')
      .send({ password })
    expect(res.status).toBe(400)
    expect(res.body.status).toBe('error')
  })

  it('Can\'t log in with email and password as non-existent user', async () => {
    const email = createEmail()
    const password = createPassword()
    const res = await login(server, email, password)
    expect(res.status).toBe(401)
    expect(res.body.status).toBe('error')
  })

  it('Can\'t log in with email only as an existing user', async () => {
    const email = createEmail()
    const password = createPassword()
    await signup(server, email, password)
    const res = await request(server)
      .post('/api/v1/login')
      .send({ email })
    expect(res.status).toBe(400)
    expect(res.body.status).toBe('error')
  })

  it('Can\'t log in with password only as an existing user', async () => {
    const email = createEmail()
    const password = createPassword()
    await signup(server, email, password)
    const res = await request(server)
      .post('/api/v1/login')
      .send({ password })
    expect(res.status).toBe(400)
    expect(res.body.status).toBe('error')
  })

  it('Can login with email and password as an existing user', async () => {
    const email = createEmail()
    const password = createPassword()
    await signup(server, email, password)
    const res = await login(server, email, password)
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.payload).toHaveProperty('email', email)
    expect(res.body.payload).toHaveProperty('token')
  })
})
