const config = require('./config')
const logger = require('./modules/logger')
const bootstrap = require('./bootstrap')

module.exports = bootstrap(config)
  .then(result => {
    logger.info('Application ready')
    return result
  })
