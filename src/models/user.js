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
  status: {
    type: String,
    enum: [ 'active', 'removed' ],
    default: 'active',
    select: false,
    hide: true,
  },
})

// Find user by email [and status = active]
UserSchema.index({ email: 1, status: 1 })

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

UserSchema.statics.findActiveById =
  function findActiveById(id, projection, options, cb) {
    return this.findOne({ _id: id, status: 'active' }, projection, options, cb)
  }

UserSchema.statics.findByEmail =
  function findActiveById(email, projection, options, cb) {
    return this.findOne({ email }, projection, options, cb)
  }

UserSchema.statics.findActiveByEmail =
  function findActiveById(email, projection, options, cb) {
    return this.findOne({ email, status: 'active' }, projection, options, cb)
  }

UserSchema.statics.removeById =
  function removeById(id, cb) {
    return this.update({ _id: id }, { status: 'removed' }, cb)
  }

module.exports = function createUserModel(mongoConnection) {
  return mongoConnection.model('User', UserSchema)
}
