const httpsServerCreator = require('./httpsServerCreator')
const instantiateServer = require('./instantiateServer')

module.exports = (config) =>
  async (listener) => {
    if (config.httpsAllow) {
      const createHttpsServer = httpsServerCreator(
        config.httpsKeyPath,
        config.httpsCertPath,
        config.httpsPassPath
      )
      return await instantiateServer(listener, createHttpsServer, config.httpsPort)
    }
    return null
  }
