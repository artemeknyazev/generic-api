const config = require('src/config')
const logger = require('src/modules/logger')
const bootstrap = require('src/bootstrap')

module.exports = bootstrap(config)
  .then(result => {
    logger.info('Application ready')
    return result
  })
