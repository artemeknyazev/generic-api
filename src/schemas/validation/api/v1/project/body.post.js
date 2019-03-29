const taskBodyPatch = require('./body.patch')

module.exports = {
  ...taskBodyPatch,
  required: [ 'title' ],
}
