const express = require('express')
const createHttpError = require('http-errors')
const {
  validateBody,
  acquireTask,
} = require('src/middlewares')
const router = express.Router()

// NOTE: authorization handled in the parent router

// TODO: abstract this!
function validateAssignedToMiddleware(req, res, next) {
  if (!req.body || !req.body.hasOwnProperty('assignedTo')) {
    return next()
  }

  const { assignedTo } = req.body
  if (req.project.isOwner(assignedTo) || req.project.isParticipant(assignedTo)) {
    return next()
  }

  next(createHttpError(400, 'assignedBy field contains assignee not from current project'))
}

const listRoute = router.route('/')
const itemRoute = router.route('/:taskId')

// Get task list for current project
listRoute.get(
  async (req, res) => {
    const { Task } = req.app.get('models')
    const taskList = await Task.findActiveByProjectId(req.project._id).exec()
    const result = taskList.map(task => task.toJSON())
    res.status(200)
    res.sendApiOk(result)
  }
)

// Create one task with current user as a creator
listRoute.post(
  validateBody('task-body-post'),
  validateAssignedToMiddleware,
  async (req, res) => {
    const { Task } = req.app.get('models')
    const newTask = await new Task({
      ...req.body,
      project: req.project._id,
      createdBy: req.user._id,
    }).save()
    res.status(200)
    res.sendApiOk(newTask.toJSON())
  }
)

// Get one task
itemRoute.get(
  acquireTask,
  async (req, res) => {
    res.status(200)
    res.sendApiOk(req.task.toJSON())
  }
)

// Update one task
itemRoute.patch(
  acquireTask,
  validateBody('task-body-patch'),
  validateAssignedToMiddleware,
  async (req, res) => {
    const { Task } = req.app.get('models')
    const task = await Task.findByIdAndUpdate(
        req.task._id,
        req.body,
        { new: true },
      )
      .exec()
    res.status(200)
    res.sendApiOk(task.toJSON())
  }
)

// Remove one task
itemRoute.delete(
  acquireTask,
  async (req, res) => {
    const { Task } = req.app.get('models')
    await Task.removeById(req.task._id)
    res.status(204)
    res.sendApiOk()
  }
)

module.exports = router
