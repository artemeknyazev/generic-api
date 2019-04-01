const { joi, ValidationError } = require('src/helpers')

async function validateAssignedTo(req) {
  if (!req.project) {
    throw new Error('validateAssignedTo is called before acquireProject')
  }
  if (!req.body || !req.body.hasOwnProperty('assignedTo')) {
    return
  }

  const { assignedTo } = req.body
  const { User } = req.app.get('models')
  const user = await User.findById(assignedTo).exec()
  if (!user) {
    throw new ValidationError(`User '${assignedTo}' does not exist`)
  }
  if (!req.project.isUserAuthorizedToBeAssignedToTask(assignedTo)) {
    throw new ValidationError(`User '${assignedTo}' is not authorized to be assigned to tasks in the project '${req.project.id}'`)
  }
}

module.exports = {
  bodySchema: joi.object().keys({
    title: joi.string().trim().min(1).max(256).escape(),
    assignedTo: joi.string().objectId(),
  }),
  bodyAsync: [
    validateAssignedTo,
  ]
}
