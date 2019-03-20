const request = require('supertest')

describe('/', () => {
  // --- Integration tests preamble start --
  let server = null
  let closeAllServers = null
  beforeEach(() => {
    const serverModule = require('../../../src')
    server = serverModule.server
    closeAllServers = serverModule.closeAllServers
  })
  afterEach(() => {
    closeAllServers()
  })
  // --- Integration tests preamble stop --

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
