const httpServerCreator = require('./httpServerCreator')
const instantiateServer = require('./instantiateServer')

module.exports = (config) =>
  async (listener) => {
    if (config.httpAllow) {
      const createHttpServer = httpServerCreator()
      return await instantiateServer(listener, createHttpServer, config.httpPort)
    }
    return null
  }
