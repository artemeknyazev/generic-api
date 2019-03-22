/* eslint-disable no-process-exit,no-console */

module.exports = (shutdown, logger = console) => {
  async function shutdownListener(signal) {
    logger(`Received ${signal}, scheduling shutdown`)
    const result = await shutdown()
    if (result) {
      console.info('Shutdown completed, exiting with 0')
      process.exit(0)
    } else {
      console.info('Shutdown is already scheduled')
    }
  }

  process.on('SIGTERM', shutdownListener)
  process.on('SIGINT', shutdownListener)
}
