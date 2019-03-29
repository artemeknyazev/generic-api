const request = require('supertest')

describe('/', () => {
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

  describe('GET /', () => {
    it('200 OK', async () => {
      const res = await request(server).get('/')
      expect(res.status).toBe(200)
    })
  })

  describe('GET /not-a-valid-address', () => {
    it('404 not found', async () => {
      const res = await request(server).get('/not-a-valid-address')
      expect(res.status).toBe(404)
    })
  })
})
