const createHttpError = require('http-errors')

module.exports = function acquireProjectMiddleware(req, res, next) {
  const { Project } = req.app.get('models')
  const project = Project.findActiveById(req.params.projectId)
  if (!project) {
    return next(createHttpError(404, 'Project not found'))
  }

  req.project = project
  next()
}
