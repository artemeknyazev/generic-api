const mongoose = require('mongoose')
const {
  setProcessEventListeners,
  mongo,
  logger,
  httpServerCreator,
  httpsServerCreator,
  instantiateServer,
} = require('./helpers')
const createApp = require('./createApp')

const createShutdown = ({
  httpServer,
  httpsServer,
  removeProcessEventListeners,
  logCloseOnShutdown,
  closeLogger,
}) =>
  async () => {
    // Close HTTP server
    if (httpServer) {
      await new Promise(resolve => httpServer.close(resolve))
    }
    // Close HTTPS server
    if (httpsServer) {
      await new Promise(resolve => httpsServer.close(resolve))
    }
    // Disconnect Mongo
    await mongoose.disconnect()
    // Close logger if required (tests allow logger to persist)
    if (logCloseOnShutdown) {
      closeLogger()
    }
    // Remove exception and unhandled unrejection listeners
    removeProcessEventListeners()
  }

module.exports = async (config) => {
  // Add exception and promise rejection event listeners
  const removeProcessEventListeners = setProcessEventListeners(logger)

  // Connect to mongo using the default connection
  await mongo(config.mongoMainConnStr)

  // Instantiate express app
  const app = createApp(config)

  // Create HTTP server if required
  let httpServer = null
  if (config.httpAllow) {
    const createHttpServer = httpServerCreator()
    httpServer = await instantiateServer(app, createHttpServer, config.httpPort)
    if (httpServer) {
      const { address, port } = httpServer.address()
      logger.info(`HTTP server is listening on ${address}:${port}`)
    }
  }

  // Create HTTPS server if required
  let httpsServer = null
  if (config.httpsAllow) {
    const createHttpsServer = httpsServerCreator(
      config.httpsKeyPath,
      config.httpsCertPath,
      config.httpsPassPath
    )
    httpsServer = await instantiateServer(app, createHttpsServer, config.httpsPort)
    if (httpsServer) {
      const { address, port } = httpsServer.address()
      logger.info(`HTTPS server is listening on ${address}:${port}`)
    }
  }

  // Create shutdown function
  const shutdown = createShutdown({
    httpServer,
    httpsServer,
    removeProcessEventListeners,
    logCloseOnShutdown: config.logCloseOnShutdown,
    closeLogger: () => logger.close(),
  })

  return {
    httpServer,
    httpsServer,
    testServer: httpsServer || httpServer,
    shutdown,
  }
}
