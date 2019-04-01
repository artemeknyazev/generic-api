const { Types: { ObjectId } } = require('mongoose')
const createHttpError = require('http-errors')

module.exports = async function acquireProjectMiddleware(req, res, next) {
  const { Project } = req.app.get('models')

  let projectId = null
  try {
    projectId = ObjectId(req.params.projectId)
  } catch (err) {
    return next(createHttpError(400, 'Invalid project id'))
  }

  const project = await Project.findActiveById(projectId).exec()
  if (!project) {
    return next(createHttpError(404, 'Project not found'))
  }

  req.project = project
  next()
}
