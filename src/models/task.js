const { Schema } = require('mongoose')

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
    defalut: 'active',
    select: false,
  }
})

TaskSchema.set('toJSON', { virtuals: true })

module.exports = function createTaskModel(mongoConnection) {
  return mongoConnection.model('Task', TaskSchema)
}
