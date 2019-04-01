const request = require('supertest')
const {
  createName,
  createEmail,
  createPassword,
} = require('tests/helpers/user')
const { signup } = require('tests/helpers/setup')

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
    expect(res.body.payload).toEqual([
      '"email" is required',
      '"password" is required',
    ])
  })

  it('Can\'t sign up with email only', async () => {
    const res = await request(server)
      .post('/api/v1/signup')
      .send({ email: createEmail() })
    expect(res.status).toBe(400)
    expect(res.body.status).toBe('error')
    expect(res.body.payload).toEqual([
      '"password" is required',
    ])
  })

  it('Can\'t sign up with password only', async () => {
    const res = await request(server)
      .post('/api/v1/signup')
      .send({ password: createPassword() })
    expect(res.status).toBe(400)
    expect(res.body.status).toBe('error')
    expect(res.body.payload).toEqual([
      '"email" is required',
    ])
  })

  it('Can sign up with valid email and valid password', async () => {
    const email = createEmail()
    const password = createPassword()
    const res = await signup(server, email, password)
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.payload).toMatchObject({ email })
  })

  it('Can sign up with name, valid email and valid password', async () => {
    const name = createName()
    const email = createEmail()
    const password = createPassword()
    const res = await signup(server, email, password, { name })
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.payload).toMatchObject({ name, email })
  })

  it('Prevents XSS in the name field', async () => {
    const name = '<script>alert(123)</script>'
    const sanitizedName = '&lt;script&gt;alert(123)&lt;&#x2F;script&gt;'
    const email = createEmail()
    const password = createPassword()
    const res = await signup(server, email, password, { name })
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.payload).toMatchObject({ name: sanitizedName, email })
  })

  it('Prevents XSS in the email field', async () => {
    const email = '<script>alert(123)</script>@test.com'
    const password = createPassword()
    const res = await signup(server, email, password)
    expect(res.status).toBe(400)
    expect(res.body.status).toBe('error')
    expect(res.body.payload).toEqual([
      '"email" must be a valid email',
    ])
  })
})
