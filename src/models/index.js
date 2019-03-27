const createUserModel = require('./user')
const createProjectModel = require('./project')
const createTaskModel = require('./task')

module.exports = (mongoConnection) => ({
  User: createUserModel(mongoConnection),
  Project: createProjectModel(mongoConnection),
  Task: createTaskModel(mongoConnection),
})
