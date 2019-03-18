const request = require('supertest')

describe('/', () => {
  let server = null
  beforeEach(() => {
    server = require('../../../src')
  })
  afterEach(() => {
    server.close()
  })

  describe('GET /not-a-valid-address', () => {
    it('404 not found', async () => {
      const res = await request(server).get('/not-a-valid-address')
      expect(res.status).toBe(404)
    })
  })
})
