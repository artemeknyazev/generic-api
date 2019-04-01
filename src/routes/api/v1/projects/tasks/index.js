const express = require('express')
const {
  validate,
  acquireTask,
} = require('src/middlewares')
const router = express.Router()

// NOTE: authorization handled in the parent router

// Get task list for current project
router.get(
  '/',

  async (req, res) => {
    const { Task } = req.app.get('models')
    const taskList = await Task.findActiveByProjectId(req.project._id).exec()
    const result = taskList.map(task => task.toJSON())
    res.status(200)
    res.sendApiOk(result)
  }
)

// Create one task with current user as a creator
router.post(
  '/',

  validate('create-task'),
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
router.get(
  '/:taskId',

  acquireTask,
  async (req, res) => {
    res.status(200)
    res.sendApiOk(req.task.toJSON())
  }
)

// Update one task
router.patch(
  '/:taskId',

  acquireTask,
  validate('patch-task'),
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
router.delete(
  '/:taskId',

  acquireTask,
  async (req, res) => {
    const { Task } = req.app.get('models')
    await Task.removeById(req.task._id)
    res.status(204)
    res.sendApiOk()
  }
)

module.exports = router
