const {
  createLogger,
  createMongoConnection,
  setProcessErrorListeners,
  setProcessShutdownSignalListeners,
  createHttpServer,
  createHttpsServer,
  createShutdown,
} = require('src/helpers')
const createModels = require('src/models')
const createApp = require('src/createApp')
const validators = require('src/validators')

module.exports = async function bootstrap(config) {
  // Create logger
  const logger = createLogger(config)

  // Add exception and unhandled rejection event listeners
  const removeProcessErrorListeners = setProcessErrorListeners(logger)

  // Connect to mongo and create models for this db connection
  const mongoConnection = await createMongoConnection(config, logger)
  const models = createModels(mongoConnection)

  // Create express app
  // Additional entities are available in middlewares using
  // app.get('models'|'logger'|'validators')
  const app = createApp(config, { models, logger, validators })

  // Create HTTP server if required
  let httpServer = await createHttpServer(config)(app)
  if (httpServer) {
    const { address, port } = httpServer.address()
    logger.info(`HTTP server is listening on ${address}:${port}`)
  }

  // Create HTTPS server if required
  let httpsServer = await createHttpsServer(config)(app)
  if (httpsServer) {
    const { address, port } = httpsServer.address()
    logger.info(`HTTPS server is listening on ${address}:${port}`)
  }

  // Create shutdown function
  const shutdown = createShutdown({
    httpServer,
    httpsServer,
    removeProcessErrorListeners,
    logger,
    mongoConnection,
  })

  // Handle graceful shutdown
  setProcessShutdownSignalListeners(shutdown, logger, config.shutdownForceExitTime)

  return {
    httpServer,
    httpsServer,
    testServer: httpsServer || httpServer,
    logger,
    shutdown,
  }
}
