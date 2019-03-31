const express = require('express')
// Handle nicely throws in async middlewares
require('express-async-errors')
const helmet = require('helmet')
const morgan = require('morgan')
const { json, urlencoded } = require('body-parser')
const cookieParser = require('cookie-parser')
const { authenticate, apiResponse } = require('src/middlewares')
const routes = require('src/routes')
const xssFilters = require('xss-filters')

const applySettings = (config, envEntities = {}) => (app) => {
  // Set entities as an app's setting. Get them using:
  //   * app.get(<key>)
  //   * req.app.get(<key>)
  //   * res.app.get(<key>)
  Object.keys(envEntities).forEach(key => {
    app.set(key, envEntities[key])
  })

  if (config.isTesting) {
    // Prevent internal logging during tests
    app.set('env', 'test')
  }

  // Set auth private key; named so that one wouldn't request it by accident
  app.set('__JWT_PRIVATE_KEY__', config.authJwtPrivateKey)

  return app
}

const applyMiddlewares = (config) => (app) => {
  app.use(helmet())
  app.use(cookieParser())
  app.use(urlencoded({ extended: false })) // false prevents injections
  app.use(json())
  if (config.isDevelopment) {
    app.use(morgan('dev', { stream: app.get('logger').infoStream }))
  }
  app.use(authenticate)
  app.use(apiResponse)
  // TODO: rate limiting!

  return app
}

const applyRouters = (routers) => (app) => {
  for (const { path, router } of routers) {
    app.use(path, router)
  }

  return app
}

const applyErrorHandler = (app) => {
  app.use(function(err, req, res, next) { // eslint-disable-line no-unused-vars
    const logger = req.app.get('logger')

    // By default we use 500 Internal Server Error
    let statusCode = 500
    let payload = 'Internal Server Error'

    if (err) {
      if (err instanceof SyntaxError) {
        // Handle body-parser json's middleware errors nicely
        statusCode = 400
        // Prevent possible reflected xss
        const contentType = xssFilters.inHTMLData(req.get('content-type'))
        payload = `Incorrect request body for content type '${contentType}'`
      } else {
        logger.error(err.stack)
      }
    } else {
      logger.error('Arrived in the general error handler without an exception')
    }

    res.status(statusCode)
    res.send({
      status: 'error',
      payload,
    })
  })

  return app
}

module.exports = function createApp(config, envEntities = {}) {
  const app = express()

  applySettings(config, envEntities)(app)
  applyMiddlewares(config)(app)
  applyRouters([
    { path: '/', router: routes },
  ])(app)
  applyErrorHandler(app)

  return app
}
