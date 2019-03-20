const request = require('supertest')

describe('/api', () => {
  // --- Integration tests preamble start --
  let server = null
  let closeAllServers = null
  beforeEach(() => {
    const serverModule = require('../../../../src')
    server = serverModule.server
    closeAllServers = serverModule.closeAllServers
  })
  afterEach(() => {
    closeAllServers()
  })
  // --- Integration tests preamble stop --

  describe('GET /', () => {
    it('200 OK by default', async () => {
      const res = await request(server).get('/api')
      expect(res.status).toBe(200)
    })
  })

  describe('GET /not-a-valid-api-call', () => {
    it('404 not found', async () => {
      const res = await request(server).get('/api/not-a-valid-api-call')
      expect(res.status).toBe(404)
      expect(res.body).toMatchObject({
        status: 'error',
        payload: 'Unknown API operation',
      })
    })
  })
})
