/* eslint-disable no-process-exit,no-console */
const createShutdownSignalListener = require('./createShutdownSignalListener')

module.exports = (
  shutdown,
  logger = console,
  forceExitTime = 20,
) => {
  const shutdownSignalListener = createShutdownSignalListener(shutdown, logger, forceExitTime)

  process.on('SIGTERM', shutdownSignalListener)
  process.on('SIGINT', shutdownSignalListener)
}
