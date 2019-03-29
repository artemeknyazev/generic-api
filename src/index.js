const config = require('src/config')
const bootstrap = require('src/bootstrap')

module.exports = bootstrap(config)
  .then(result => {
    result.logger.info('Application ready')
    return result
  })
