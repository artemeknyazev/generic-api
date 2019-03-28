const { Schema } = require('mongoose')
const mongooseHidden = require('mongoose-hidden')

const TaskSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  status: {
    type: String,
    enum: [ 'active', 'removed' ],
    default: 'active',
    select: false,
    hide: true,
  },
})

TaskSchema.set('toJSON', { virtuals: true })

TaskSchema.plugin(mongooseHidden())

TaskSchema.statics.findActiveById =
  function findActiveById(id, ...args) {
    return this.findOne({ _id: id, status: 'active' }, ...args)
  }

TaskSchema.statics.findActiveByProjectId =
  function findActiveById(projectId, ...args) {
    return this.find({ project: projectId, status: 'active' }, ...args)
  }

TaskSchema.statics.removeById =
  function removeById(id, cb) {
    return this.updateOne({ _id: id }, { status: 'removed' }, cb)
  }

module.exports = function createTaskModel(mongoConnection) {
  return mongoConnection.model('Task', TaskSchema)
}
