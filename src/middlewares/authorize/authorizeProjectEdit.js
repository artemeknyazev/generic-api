const createHttpError = require('http-errors')

module.exports = function authorizeProjectEditMiddleware(req, res, next) {
  const project = req.project
  if (!project) {
    return next(new Error('authorizeProjectView called before acquireProjectMiddleware'))
  }

  const userId = req.user._id
  if (project.owner === userId) {
    return next()
  }

  next(createHttpError(403))
}
