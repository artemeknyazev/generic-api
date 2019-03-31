const joi = require('src/helpers/validate/joi')
const taskBodyPatch = require('./body.patch')

module.exports = taskBodyPatch.keys({
  title: joi.reach(taskBodyPatch, 'title').required(),
})
