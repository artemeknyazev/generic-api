let { escape } = require('validator')
let joi = require('joi')

const objectIdStringExtension = (joi) => ({
  name: 'string',
  base: joi.string(),
  language: {
    objectId: 'must be a valid MongoDB ObjectId',
  },
  rules: [{
    name: 'objectId',
    validate(params, value, state, options) {
      if (String(value).match(/^[a-f\d]{24}$/i)) {
        return value
      } else {
        return this.createError('string.language', { value }, state, options)
      }
    },
  }],
})

const sanitizedString = (joi) => ({
  name: 'string',
  base: joi.string(),
  rules: [{
    name: 'escape',
    validate(params, value, state, options) { // eslint-disable-line no-unused-vars
      return escape(String(value))
    },
  }]
})

module.exports = joi
  .extend(objectIdStringExtension)
  .extend(sanitizedString)
