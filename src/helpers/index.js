/* eslint-disable global-require */

module.exports = {
  createHttpServer: require('./server/createHttpServer'),
  createHttpsServer: require('./server/createHttpsServer'),
  createLogger: require('./logger/createLogger'),
  createMongoConnection: require('./db/createMongoConnection'),
  createShutdown: require('./shutdown/createShutdown'),
  createShutdownSignalListener: require('./shutdown/createShutdownSignalListener'),
  httpServerCreator: require('./server/httpServerCreator'),
  httpsServerCreator: require('./server/httpsServerCreator'),
  instantiateServer: require('./server/instantiateServer'),
  setProcessErrorListeners: require('./error/setProcessErrorListeners'),
  setProcessShutdownSignalListeners: require('./shutdown/setProcessShutdownSignalListeners'),
  joi: require('./validate/joi'),
  ValidationError: require('./validate/ValidationError')
}
