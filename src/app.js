const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const { json, urlencoded } = require('body-parser')
const logger = require('./helpers/logger')
const { isDevelopment } = require('./config')

const app = express()

// Middlewares
app.use(helmet())
app.use(urlencoded({ extended: false })) // false prevents injections
app.use(json())
if (isDevelopment) {
  app.use(morgan('dev', { stream: logger.infoStream }))
}

// Routes and error handlers
app.use('/', require('./routes'))
app.use((err, req, res) => {
  logger.error(err)
  res.status(500)
  res.send({
    status: 'error',
    payload: 'Internal error',
  })
})

module.exports = app
