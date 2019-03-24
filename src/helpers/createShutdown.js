module.exports = function createShutdown({
  httpServer,
  httpsServer,
  removeProcessErrorListeners,
  logger,
  // TODO: change to a list of mongo connections instead of a whole mongoose object
  mongoose,
}) {
  let isShuttingDown = false
  return async function shutdown() {
    // Multiple calls to shutdown result in shutting down only once
    if (isShuttingDown) {
      return false // shutdown in process
    }
    isShuttingDown = true

    // Close HTTP server
    if (httpServer) {
      try {
        await new Promise(resolve => httpServer.close(resolve))
      } catch (err) {
        logger.error(err)
      }
    }

    // Close HTTPS server
    if (httpsServer) {
      try {
        await new Promise(resolve => httpsServer.close(resolve))
      } catch (err) {
        logger.error(err)
      }
    }

      // Disconnect Mongo
    try {
      await mongoose.disconnect()
    } catch (err) {
      logger.error(err)
    }

    // Remove listeners before logger because they use logger
    removeProcessErrorListeners()

    // Close logger
    // NOTE: No way to subscribe for 'everything closed' event, close synchronously
    try {
      logger.close()
    } catch (err) {
      console.error(`logger.close: ${err}`) // eslint-disable-line no-console
    }

    // NOTE: shutdown doesn't exit, exits it's caller
    return true // shutdown completed
  }
}
