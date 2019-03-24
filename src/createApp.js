const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const { json, urlencoded } = require('body-parser')
const routes = require('src/routes')

const applyMiddlewares = (config) => (app) => {
  app.use(helmet())
  app.use(urlencoded({ extended: false })) // false prevents injections
  app.use(json())
  if (config.isDevelopment) {
    app.use(morgan('dev', { stream: app.get('logger').infoStream }))
  }
  return app
}

const applyRoutes = (app) => {
  app.use('/', routes)
  return app
}

const applyErrorHandler = (app) => {
  app.use(function(err, req, res, next) { // eslint-disable-line no-unused-vars
    app.get('logger').error(err)
    res.status(500)
    res.send({
      status: 'error',
      payload: 'Internal error',
    })
  })
  return app
}

module.exports = function createApp(config, logger) {
  const app = express()

  // Set logger as an app's setting. Get logger using:
  //   * app.get('logger')
  //   * req.app.get('logger')
  //   * res.app.get('logger')
  app.set('logger', logger)

  if (config.isTesting) {
    // Prevent internal logging during tests
    app.set('env', 'test')
  }

  applyMiddlewares(config)(app)
  applyRoutes(app)
  applyErrorHandler(app)

  return app
}
