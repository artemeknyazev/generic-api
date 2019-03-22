/* eslint-disable no-process-exit,no-console */

module.exports = function createShutdownSignalListener(
  shutdown,
  logger = console,
  forceExitTime = 20,
) {
  let isShuttingDown = false

  return async function shutdownSignalListener(signal) {
    logger.info(`Received ${signal}, scheduling shutdown`)
    if (!isShuttingDown) {
      isShuttingDown = true

      const forceExitTimeout = setTimeout(() => {
        console.error('Process did not exit after 20 seconds, performing force exit')
        process.exit(1)
      }, forceExitTime * 1000)

      const result = await shutdown()
      if (result) { // shutdown completed
        clearTimeout(forceExitTimeout)
        console.info('Shutdown completed, exiting with 0') // There may be no logger, use console
        process.exit(0)
        return
      }
    }
    // Is already shutting down or shutdown returned false
    logger.info('Shutdown is already scheduled')
  }
}