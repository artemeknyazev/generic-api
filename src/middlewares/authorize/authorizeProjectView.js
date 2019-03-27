const createHttpError = require('http-errors')

module.exports = function authorizeProjectViewMiddleware(req, res, next) {
  const project = req.project
  if (!project) {
    return next(new Error('authorizeProjectView called before acquireProjectMiddleware'))
  }

  const userId = req.user._id
  if (project.isOwner(userId) || project.isParticipant(userId)) {
    return next()
  }

  next(createHttpError(403))
}