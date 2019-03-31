const { Types: { ObjectId } } = require('mongoose')
const createHttpError = require('http-errors')

module.exports = async function acquireTaskMiddleware(req, res, next) {
  const { Task } = req.app.get('models')

  let taskId = null
  try {
    taskId = ObjectId(req.params.taskId)
  } catch (err) {
    return next(createHttpError(400, 'Invalid task id'))
  }

  const task = await Task.findActiveById(taskId).exec()
  if (!task) {
    return next(createHttpError(404, 'Task not found'))
  }

  req.task = task
  next()
}
