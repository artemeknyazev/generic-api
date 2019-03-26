const express = require('express')
const createHttpError = require('http-errors')
const {
  validateBody,
  acquireProject,
  authorizeProjectEdit,
  authorizeProjectView,
} = require('src/middlewares')
const router = express.Router()

// Get project list for logged in user
// Returns active projects where user is an owner or is a participant
router.get(
  '/',

  async (req, res) => {
    const { Project } = req.app.get('models')
    const projectList = await Project.findActiveForUser(req.user._id).exec()
    const result = projectList.map(project => project.toJSON())
    res.status(200)
    res.send(result)
  }
)

// Create new project with current user as an owner
router.post(
  '/',

  validateBody('project-body-post'),
  async (req, res) => {
    const { Project } = req.app.get('models')
    const newProject = await new Project({ ...req.body, owner: req.user._id }).save()
    res.status(200)
    res.send(newProject.toJSON())
  }
)

// Get specific project for logged in user
router.get(
  '/:projectId',

  acquireProject,
  authorizeProjectView,
  async (req, res) => {
    res.status(200)
    res.send(req.project.toJSON())
  }
)

// Change project info; available only for project owner
router.patch(
  '/:projectId',

  acquireProject,
  authorizeProjectEdit,
  validateBody('project-body-patch'),
  async (req, res, next) => {
    if (req.project.owner !== req.user._id) {
      return next(createHttpError(403))
    }

    const { Project } = req.app.get('models')
    // NOTE: For now API resources contain the same arrangement of fields as models
    const project = await Project.findByIdAndUpdate(
        req.project._id,
        req.body,
        { new: true },
      )
      .exec()
    res.status(200)
    res.send(project.toJSON())
  }
)

// Remove project; available only for project owner
router.delete(
  '/:projectId',

  acquireProject,
  authorizeProjectEdit,
  async (req, res) => {
    const { Project } = req.app.get('models')
    await Project.removeById(req.project._id)
    // project removed, no content
    res.sendStatus(204)
  }
)

// Manipulate project's tasks
router.use(
  '/:projectId/tasks',

  acquireProject,
  require('./tasks'),
)

module.exports = router
