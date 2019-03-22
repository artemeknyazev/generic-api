const request = require('supertest')

describe('/api/v1', () => {
  // --- Integration tests preamble start --
  let server = null
  let shutdown = null
  beforeEach((done) => {
    require('src/index').then(result => {
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
    it('200 OK by default', async () => {
      const res = await request(server).get('/api/v1')
      expect(res.status).toBe(200)
    })
  })

  describe('GET /not-a-valid-api-call', () => {
    it('404 not found', async () => {
      const res = await request(server).get('/api/v1/not-a-valid-api-call')
      expect(res.status).toBe(405)
      expect(res.body).toMatchObject({
        status: 'error',
        payload: 'Method Not Allowed',
      })
    })
  })
})
