const { Schema } = require('mongoose')

module.exports = (mongoConnection) => {
  const userSchema = new Schema({
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
  })

  const userModel = mongoConnection.model('user', userSchema)

  return userModel
}
