const createHttpError = require('http-errors')

module.exports = function authorizeProjectEditMiddleware(req, res, next) {
  const project = req.project
  if (!project) {
    return next(new Error('authorizeProjectEditMiddleware is called before acquireProjectMiddleware'))
  }

  const userId = req.user._id
  if (project.isUserAuthroizedToEdit(userId)) {
    return next()
  }

  next(createHttpError(403))
}
