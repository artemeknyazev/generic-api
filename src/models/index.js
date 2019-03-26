const createUserModel = require('./user')
const createProjectModel = require('./user')
const createTaskModel = require('./user')

module.exports = (mongoConnection) => ({
  User: createUserModel(mongoConnection),
  Project: createProjectModel(mongoConnection),
  Task: createTaskModel(mongoConnection),
})
