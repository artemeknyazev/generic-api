/* eslint-disable no-process-exit */

module.exports = (logger = console) => {
  function uncaughtExceptionListener(err) {
    // TODO: pass call stack too
    logger.error(err)
    process.exit(1)
  }

  function unhadledRejectionListener(err) {
    // Requalify an unhandled rejection to an uncaught exception
    throw err
  }

  process.on('uncaughtException', uncaughtExceptionListener)
  process.on('unhandledRejection', unhadledRejectionListener)

  return function removeListeners() {
    process.removeListener('uncaughtException', uncaughtExceptionListener)
    process.removeListener('unhandledRejection', unhadledRejectionListener)
  }
}
