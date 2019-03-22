const setProcessErrorListeners = require('./setProcessErrorListeners')

module.exports = function createShutdown({
  httpServer,
  httpsServer,
  removeProcessErrorListeners,
  logCloseOnShutdown,
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
        logger.close()
      } catch (err) {
        console.error(`closeLogger: ${err}`) // eslint-disable-line no-console
      }
    }
    // NOTE: shutdown doesn't exit, exits it's caller
    return true // shutdown completed
  }
}
