const { ValidationError } = require('ajv')
const { HttpError } = require('http-errors')
const {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} = require('jsonwebtoken')

module.exports = function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const logger = req.app.get('logger')

  // By default we use 500 Internal Server Error
  let statusCode = 500
  let payload = 'Internal Server Error'

  if (err) {
    // If it's a known exception type, inherit data from it
    if (err instanceof HttpError) {
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
    } else if (err instanceof ValidationError) {
      // Validation errors are always 400 Bad Request
      // TODO: prepare Ajv's error response for better readablity
      statusCode = 400
      payload = err.errors
    } else if (
      err instanceof JsonWebTokenError ||
      err instanceof NotBeforeError ||
      err instanceof TokenExpiredError
    ) {
      // TODO: maybe use more granular approach to handle these exceptions
      statusCode = 401
      payload = 'Unauthorized'
    } else {
      // Log all unknown exceptions
      logger.error(err.stack)
    }
  } else {
    logger.error('Arrived in /api/v1 error handler without an exception')
  }

  res.status(statusCode)
  res.sendApiErr(payload)
}
