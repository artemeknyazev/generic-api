const createHttpError = require('http-errors')

module.exports = async function acquireTaskMiddleware(req, res, next) {
  const { Task } = req.app.get('models')
  const task = await Task.findActiveById(req.params.taskId).exec()
  if (!task) {
    return next(createHttpError(404, 'Task not found'))
  }

  req.task = task
  next()
}
