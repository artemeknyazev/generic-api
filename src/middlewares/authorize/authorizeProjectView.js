const createHttpError = require('http-errors')

module.exports = function authorizeProjectViewMiddleware(req, res, next) {
  const project = req.project
  if (!project) {
    return next(new Error('authorizeProjectViewMiddleware is called before acquireProjectMiddleware'))
  }

  const userId = req.user._id
  if (project.isUserAuthorizedToView(userId)) {
    return next()
  }

  next(createHttpError(403))
}
