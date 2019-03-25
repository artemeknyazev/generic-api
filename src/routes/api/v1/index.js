const Ajv = require('ajv')
const createHttpError = require('http-errors')
const express = require('express')
const router = express.Router()
const { validateBody } = require('src/middlewares')

router.post(
  '/signup',

  validateBody('signup-body-post'),
  (req, res) => {
    res.status(200)
    res.send(req.body)
  }
)

// Catch-em-all route for unsupported methods
router.all('*', function(req, res, next) {
  next(createHttpError(405))
})

// Error handler for all API routes; ensures consistent error response structure
router.use(function (err, req, res, next) { // eslint-disable-line no-unused-vars
  const logger = req.app.get('logger')

  // By default we use 500 Internal Server Error
  let statusCode = 500
  let payload = 'Internal Server Error'

  if (err) {
    // If it's a known exception type, inherit data from it
    if (err instanceof createHttpError.HttpError) {
      // Inherit status code and a message from HTTP errors. Common errors are:
      //   * 400 (422?) for validation failure
      //   * 401 for authentication failure
      //   * 403 for read/modify authorization failure
      //   * 404 for not found entities during both read and write requests
      //   * 405 (501?) for unsupported methods
      //   * 409 for conflicts (do not use for now)
      //   * 429 for rate limiting
      statusCode = err.statusCode
      payload = err.message
    } else if (err instanceof Ajv.ValidationError) {
      // Validation errors are always 400 Bad Request
      // TODO: prepare Ajv's error response for better readablity
      statusCode = 400
      payload = err.errors
    } else {
      // Log all unknown exceptions
      logger.error(err)
    }
  } else {
    // TODO: log requests too
    logger.error('Arrived in /api/v1 error handler without an exception')
  }

  res.status(statusCode)
  res.send({
    status: 'error',
    payload,
  })
})

module.exports = router
