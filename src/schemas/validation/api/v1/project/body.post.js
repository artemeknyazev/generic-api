const joi = require('src/helpers/validate/joi')
const projectBodyPatch = require('./body.patch')

module.exports = projectBodyPatch.keys({
  title: joi.reach(projectBodyPatch, 'title').required(),
})
