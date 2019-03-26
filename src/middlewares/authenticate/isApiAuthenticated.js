const createHttpError = require('http-errors')

// Go to error handler if not authenticated

module.exports = function isAuthenticatedMiddleware(req, res, next) {
  if (!req.isAuthenticated) {
    return next(createHttpError(401))
  }

  next()
}
