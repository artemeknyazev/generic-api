const request = require('supertest')
const {
  createEmail,
  createPassword,
  removeUser,
} = require('tests/helpers/user')
const {
  login,
  signup,
  signupAndLogin,
} = require('tests/helpers/setup')

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
    expect(res.body.payload).toEqual([
      '"email" is required',
      '"password" is required',
    ])
  })

  it('Can\'t log in with an email only as a non-existent user', async () => {
    const res = await request(server)
      .post('/api/v1/login')
      .send({ email: createEmail() })
    expect(res.status).toBe(400)
    expect(res.body.status).toBe('error')
    expect(res.body.payload).toEqual([
      '"password" is required',
    ])
  })

  it('Can\'t log in with a password only as a non-existent user', async () => {
    const res = await request(server)
      .post('/api/v1/login')
      .send({ password: createPassword() })
    expect(res.status).toBe(400)
    expect(res.body.status).toBe('error')
    expect(res.body.payload).toEqual([
      '"email" is required',
    ])
  })

  it('Can\'t log in with an email and a password as a non-existent user', async () => {
    const email = createEmail()
    const password = createPassword()
    const res = await login(server, email, password)
    expect(res.status).toBe(401)
    expect(res.body.status).toBe('error')
    expect(res.body.payload).toEqual([
      'Invalid email or password',
    ])
  })

  it('Can\'t log in with an email only as an existing user', async () => {
    const email = createEmail()
    const password = createPassword()
    await signup(server, email, password)
    const res = await request(server)
      .post('/api/v1/login')
      .send({ email })
    expect(res.status).toBe(400)
    expect(res.body.status).toBe('error')
    expect(res.body.payload).toEqual([
      '"password" is required',
    ])
  })

  it('Can\'t log in with a password only as an existing user', async () => {
    const email = createEmail()
    const password = createPassword()
    await signup(server, email, password)
    const res = await request(server)
      .post('/api/v1/login')
      .send({ password })
    expect(res.status).toBe(400)
    expect(res.body.status).toBe('error')
    expect(res.body.payload).toEqual([
      '"email" is required',
    ])
  })

  it('Can login with an email and a password as an existing user', async () => {
    const email = createEmail()
    const password = createPassword()
    await signup(server, email, password)
    const res = await login(server, email, password)
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.payload).toHaveProperty('email', email)
    expect(res.body.payload).toHaveProperty('token')
  })

  it('Can\'t log in as a removed user', async () => {
    const { email, password, token } = await signupAndLogin(server)
    await removeUser(server, token)
    const res = await login(server, email, password)
    expect(res.status).toBe(401)
    expect(res.body.payload).toEqual([
      'User were removed. Reactivate using /api/v1/reactivate',
    ])
  })
})
