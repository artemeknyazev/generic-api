const joi = require('src/helpers/validate/joi')
const patch = require('./patch')

module.exports = {
  ...patch,
  // inherit schema and mark fields as required
  bodySchema: patch.bodySchema.keys({
    title: joi.reach(patch.bodySchema, 'title').required(),
  }),
}
