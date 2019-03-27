const projectBodyPatch = require('./body.patch')

module.exports = {
  ...projectBodyPatch,
  required: [ 'title' ],
}
