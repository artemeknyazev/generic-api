/* eslint-disable global-require */

const createHttpError = require('http-errors')
const express = require('express')
const { isApiAuthenticated } = require('src/middlewares')
const router = express.Router()

router.use(
  '/user',

  isApiAuthenticated,
  require('./user')
)

router.use('/signup', require('./signup'))
router.use('/login', require('./login'))

// Catch-em-all route for unsupported methods
router.all('*', function(req, res, next) {
  next(createHttpError(405))
})

// Error handler for all API routes; ensures consistent error response structure
router.use(require('./errorHandler'))

module.exports = router
