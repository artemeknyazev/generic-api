const { Schema } = require('mongoose')

const ProjectSchema = new Schema({
  title: {
    type: String,
    trim: true,
  },
  slug: {
    type: String,
    trim: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  status: {
    type: String,
    enum: [ 'active', 'removed' ],
    select: false,
  },
})

// Get project by slug
ProjectSchema.index({ slug: 1, status: 1 })

// Get project list by owner and status = active
ProjectSchema.index({ owner: 1, status: 1 })

// Get project list for a user
ProjectSchema.index({ participants: 1, status: 1 })

ProjectSchema.statics.findActiveById =
  function findActiveByIdOrSlug(idOrSlug, ...args) {
    return this.findOne({ _id: idOrSlug, status: 'active' }, ...args)
  }

ProjectSchema.statics.findActiveByIdAndUpdate =
  function findActiveByIdOrSlug(idOrSlug, ...args) {
    return this.findOne({ _id: idOrSlug, status: 'active' }, ...args)
  }

ProjectSchema.statics.findActiveForUser =
  function findActiveForUser(userId, ...args) {
    return this.find(
      {
        '$or': [
          { owner: userId },
          { participants: userId },
        ],
        status: 'active',
      },
      ...args,
    )
  }

ProjectSchema.statics.removeById =
  function removeById(id, cb) {
    return this.updateOne({ _id: id }, { status: 'removed' }, cb)
  }

module.exports = function createProjectModel(mongoConnection) {
  return mongoConnection.model('Project', ProjectSchema)
}
