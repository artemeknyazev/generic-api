const createHttpError = require('http-errors')

module.exports = async function acquireProjectMiddleware(req, res, next) {
  const { Project } = req.app.get('models')
  const project = await Project.findActiveById(req.params.projectId).exec()
  if (!project) {
    return next(createHttpError(404, 'Project not found'))
  }

  req.project = project
  next()
}
