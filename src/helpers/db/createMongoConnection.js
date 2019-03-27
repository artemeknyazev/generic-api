const mongoose = require('mongoose')

module.exports = (config, logger) =>
  new Promise((resolve) => {
    const connection = mongoose.createConnection(
      config.mongoMainConnStr,
      {
        // Mongoose-specific
        // Prevent buffering to find about connection errors early
        bufferCommands: false,
        // Prevent creating indexes
        // autoIndex: false,

        // MongoDB driver-specific
        // If not connected, return errors immediately rather than waiting for reconnect
        bufferMaxEntries: 0,
        useNewUrlParser: true,
        // Prevent deprecation warning
        useCreateIndex: true,
        useFindAndModify: false,
        // Keep connection alive
        keepAlive: true,
        keepAliveInitialDelay: 300000,
        // Allow reconnection
        reconnectTries: config.mongoMainReconnectTries,
        reconnectInterval: config.mongoMainReconnectInterval,
        // Promises
        promiseLibrary: global.Promise,
      }
    )

    const connectedListener = () => {
      // Log if there's an error
      connection.on('error', (err) => {
        logger.error(err)
      })

      // Log if disconnected
      connection.on('disconnected', () => {
        logger.warn('Diconnected from MongoDB')
      })

      // App can't recover, throw
      connection.on('reconnectFailed', () => {
        throw new Error('Reconnection to MongoDB failed')
      })

      // Log if reconnect succeeded
      connection.on('reconnected', () => {
        logger.warn('Reconnected to MongoDB')
      })

      resolve(connection)
    }

    // NOTE: mongoose will throw if it wouldn't connect, no need to handle manually
    connection.once('connected', connectedListener)
  })
