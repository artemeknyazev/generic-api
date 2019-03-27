const request = require('supertest')
const {
  login,
  signupAndLogin,
  get,
  patch,
  remove,
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

  it('Can access current user info after log in', async () => {
    const { email, token } = await signupAndLogin(server)
    const res = await get(server, token)
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.payload).toEqual({ email })
  })

  it('Can change current user info after log in', async () => {
    const { email, token } = await signupAndLogin(server)
    const name = Date.now().toString()
    const res = await patch(server, token, { name })
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.payload).toEqual({ name, email })
  })

  it('User info change persists between queries', async () => {
    const { email, token } = await signupAndLogin(server)
    const name = Date.now().toString()
    await patch(server, token, { name })
    const res = await get(server, token)
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.payload).toEqual({ name, email })
  })

  it('Can remove user after log in', async () => {
    const { token } = await signupAndLogin(server)
    const res = await remove(server, token)
    expect(res.status).toBe(204)
  })

  it('Can\'t log in as a removed user', async () => {
    const { email, password, token } = await signupAndLogin(server)
    await remove(server, token)
    const res = await login(server, email, password)
    expect(res.status).toBe(401)
    expect(res.body.status).toBe('error')
    expect(res.body.payload).toEqual('User were removed. Reactivate using /api/v1/reactivate')
  })

  it('Can\'t access user info when using removed user credentials', async () => {
    const { token } = await signupAndLogin(server)
    await remove(server, token)
    const res = await get(server, token)
    expect(res.status).toBe(401)
    expect(res.body.status).toBe('error')
  })
})
