const { Schema } = require('mongoose')
const mongooseHidden = require('mongoose-hidden')
const jwt = require('jsonwebtoken')

const UserSchema = new Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
    select: false,
    hide: true,
  },
})

UserSchema.plugin(mongooseHidden())

UserSchema.methods.toTokenPayload =
  function toTokenPayload() {
    return {
      _id: this._id,
    }
  }

UserSchema.methods.generateAuthToken =
  function generateAuthToken(jwtPrivateKey, cb) {
    const tokenPayload = this.toTokenPayload()
    jwt.sign(tokenPayload, jwtPrivateKey, cb)
  }

module.exports = function createUserModel(mongoConnection) {
  return mongoConnection.model('User', UserSchema)
}
