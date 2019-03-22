const mongoose = require('mongoose')
const {
  setProcessErrorListeners,
  setProcessShutdownSignalListeners,
  instantiateHttpServer,
  instantiateHttpsServer,
  createShutdown,
} = require('src/helpers')
const mongo = require('src/modules/db/mongo')
const logger = require('src/modules/logger')
const createApp = require('src/createApp')

module.exports = async function bootstrap(config) {
  // Add exception and unhandled rejection event listeners
  const removeProcessErrorListeners = setProcessErrorListeners(logger)

  // Connect to mongo using the default connection
  await mongo(config.mongoMainConnStr)

  // Instantiate express app
  const app = createApp(config)

  // Create HTTP server if required
  let httpServer = await instantiateHttpServer(config)(app)
  if (httpServer) {
    const { address, port } = httpServer.address()
    logger.info(`HTTP server is listening on ${address}:${port}`)
  }

  // Create HTTPS server if required
  let httpsServer = await instantiateHttpsServer(config)(app)
  if (httpsServer) {
    const { address, port } = httpsServer.address()
    logger.info(`HTTPS server is listening on ${address}:${port}`)
  }

  // Create shutdown function
  const shutdown = createShutdown({
    httpServer,
    httpsServer,
    removeProcessErrorListeners,
    logCloseOnShutdown: config.logCloseOnShutdown,
    logger,
    mongoose,
  })

  // Handle graceful shutdown
  setProcessShutdownSignalListeners(shutdown, logger, config.shutdownForceExitTime)

  return {
    httpServer,
    httpsServer,
    testServer: httpsServer || httpServer,
    shutdown,
  }
}
