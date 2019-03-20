/* eslint-disable no-process-exit,global-require */
const {
  httpAllow,
  httpPort,
  httpsAllow,
  httpsPort,
} = require('./config')
const logger = require('./helpers/logger')

// Set error handlers before instantiating an application
process.on('uncaughtException', (err) => {
  logger.error(err)
  process.exit(1)
})
process.on('unhandledRejection', (err) => {
  // Requalify an unhandled rejection to an uncaught exception
  throw err
})

// Instantiate app servers
const app = require('./app')
const createHttpServer = require('./helpers/createHttpServer')
const createHttpsServer = require('./helpers/createHttpsServer')

let httpServer = null
let httpsServer = null
if (httpAllow) {
  httpServer = createHttpServer(app)
    .listen(httpPort, () => {
      const address = httpServer.address()
      logger.info(`HTTP server is listening on ${address.address}:${address.port}`)
    })
}
if (httpsAllow) {
  httpsServer = createHttpsServer(app)
    .listen(httpsPort, () => {
      const address = httpsServer.address()
      logger.info(`HTTP server is listening on ${address.address}:${address.port}`)
    })
}

function closeAllServers() {
  httpServer && httpServer.close()
  httpsServer && httpsServer.close()
}

module.exports = {
  httpServer,
  httpsServer,
  // tests use whichever provided prioritizing https
  server: httpsServer || httpServer,
  closeAllServers,
}
