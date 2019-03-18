const app = require('./app')
const logger = require('./helpers/logger')
const { port } = require('./config')

const server = app.listen(port, () => {
  const addr = server.address()
  logger.info(`App is listening on ${addr.address}:${addr.port}`)
})

process.on('uncaughtException', (err) => {
  logger.error(err)
  process.exit(1) // eslint-disable-line no-process-exit
})

// An unhandled rejection becomes an uncaught exception handled above
process.on('unhandledRejection', (err) => {
  throw err
})

module.exports = server
