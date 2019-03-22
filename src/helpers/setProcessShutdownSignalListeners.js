/* eslint-disable no-process-exit,no-console */
const createShutdownSignalListener = require('./createShutdownSignalListener')

module.exports = (
  shutdown,
  logger = console,
  forceExitTime = 20,
) => {
  const shutdownListener = createShutdownSignalListener(shutdown, logger, forceExitTime)

  process.on('SIGTERM', shutdownListener)
  process.on('SIGINT', shutdownListener)
}
