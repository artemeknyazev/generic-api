const { Schema } = require('mongoose')

const TaskSchema = new Schema({
  title: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
  },
  status: {
    type: String,
    enum: [ 'active', 'removed' ],
  }
})

TaskSchema.set('toJSON', { virtuals: true })

module.exports = function createTaskModel(mongoConnection) {
  return mongoConnection.model('Task', TaskSchema)
}
