const createUserModel = require('./user')

module.exports = (mongoConnection) => ({
  User: createUserModel(mongoConnection),
})
