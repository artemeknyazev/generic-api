const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const { json, urlencoded } = require('body-parser')
const logger = require('./modules/logger')
const routes = require('./routes')

const applyMiddlewares = (config) => (app) => {
  app.use(helmet())
  app.use(urlencoded({ extended: false })) // false prevents injections
  app.use(json())
  if (config.isDevelopment) {
    app.use(morgan('dev', { stream: logger.infoStream }))
  }
  return app
}

const applyRoutes = (app) => {
  app.use('/', routes)
  return app
}

const applyErrorHandler = (app) => {
  app.use((err, req, res) => {
    logger.error(err)
    res.status(500)
    res.send({
      status: 'error',
      payload: 'Internal error',
    })
  })
  return app
}

module.exports = function createApp(config) {
  const app = express()
  applyMiddlewares(config)(app)
  applyRoutes(app)
  applyErrorHandler(app)
  return app
}
