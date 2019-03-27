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

describe('/api/v1/signup', () => {
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

  it('Can\'t sign up with empty data', async () => {
    const res = await request(server)
      .post('/api/v1/signup')
      .send({})
    expect(res.status).toBe(400)
    expect(res.body.status).toBe('error')
  })

  it('Can\'t sign up with email only', async () => {
    const email = createEmail()
    const res = await request(server)
      .post('/api/v1/signup')
      .send({ email })
    expect(res.status).toBe(400)
    expect(res.body.status).toBe('error')
  })

  it('Can\'t sign up with password only', async () => {
    const password = createPassword()
    const res = await request(server)
      .post('/api/v1/signup')
      .send({ password })
    expect(res.status).toBe(400)
    expect(res.body.status).toBe('error')
  })

  it('Can sign up with valid email and valid password', async () => {
    const email = createEmail()
    const password = createPassword()
    const res = await request(server)
      .post('/api/v1/signup')
      .send({ email, password })
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})
