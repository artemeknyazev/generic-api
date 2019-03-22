const mongoose = require('mongoose')
const {
  setProcessErrorListeners,
  mongo,
  logger,
  httpServerCreator,
  httpsServerCreator,
  instantiateServer,
  setProcessSignalListeners,
} = require('./helpers')
const createApp = require('./createApp')

const createShutdown = ({
  httpServer,
  httpsServer,
  removeProcessErrorListeners,
  logCloseOnShutdown,
  closeLogger,
}) => {
  let isShuttingDown = false
  return async () => {
    // Multiple calls to shutdown result in shutting down only once
    if (isShuttingDown) {
      return false // shutdown in process
    }
    isShuttingDown = true
    try {
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
    } catch (err) {
      logger.error(err)
    }
    // Remove listeners before logger because they use logger
    removeProcessErrorListeners()
    // Handle 'uncaught' and 'unhandled' errors from here on using console instead of logger
    setProcessErrorListeners(console)
    // Close logger if required (tests allow logger to persist)
    if (logCloseOnShutdown) {
      try {
        // NOTE: No way to subscribe for 'everything closed' event, close synchronously
        closeLogger()
      } catch (err) {
        console.error(`closeLogger: ${err}`) // eslint-disable-line no-console
      }
    }
    // NOTE: shutdown doesn't exit, exits it's caller
    return true // shutdown completed
  }
}

module.exports = async (config) => {
  // Add exception and unhandled rejection event listeners
  const removeProcessErrorListeners = setProcessErrorListeners(logger)

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
    removeProcessErrorListeners,
    logCloseOnShutdown: config.logCloseOnShutdown,
    closeLogger: () => logger.close(),
  })

  // Handle graceful shutdown
  setProcessSignalListeners(shutdown, logger)

  return {
    httpServer,
    httpsServer,
    testServer: httpsServer || httpServer,
    shutdown,
  }
}
