const express = require('express')
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
    res.sendApiOk(result)
  }
)

// Create new project with current user as an owner
router.post(
  '/',

  validateBody('project-body-post'),
  // TODO: validate participants!
  async (req, res) => {
    const { Project } = req.app.get('models')
    const newProject = await new Project({ ...req.body, owner: req.user._id }).save()
    res.status(200)
    res.sendApiOk(newProject.toJSON())
  }
)

// Get specific project for logged in user
router.get(
  '/:projectId',

  acquireProject,
  authorizeProjectView,
  async (req, res) => {
    res.status(200)
    res.sendApiOk(req.project.toJSON())
  }
)

// Change project info; available only for project owner
router.patch(
  '/:projectId',

  acquireProject,
  authorizeProjectEdit,
  validateBody('project-body-patch'),
  // TODO: validate participants!
  async (req, res) => {
    const { Project } = req.app.get('models')
    // NOTE: For now API resources contain the same arrangement of fields as models
    const project = await Project.findByIdAndUpdate(
        req.project._id,
        req.body,
        { new: true },
      )
      .exec()
    res.status(200)
    res.sendApiOk(project.toJSON())
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
    // TODO: remove all linked tasks
    // project removed, no content
    res.status(204)
    res.sendApiOk()
  }
)

// Manipulate project's tasks
router.use(
  '/:projectId/tasks',

  acquireProject,
  // One who can view project info may also create/modify all tasks
  authorizeProjectView,
  require('./tasks'),
)

module.exports = router
