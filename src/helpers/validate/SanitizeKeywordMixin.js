/* eslint-disable no-unused-vars */

const validator = require('validator')
const xssFilters = require('xss-filters')

// Code sample: https://github.com/epoberezkin/ajv-keywords/blob/master/keywords/transform.js

module.exports = function defineSanitizeKeyword(ajv) {
  const transform = {
    'escape': validator.escape,
    'uriInHTMLData': xssFilters.uriInHTMLData,
  }

  function compile(schema, parentSchema) {
    return function (data, dataPath, object, key) {
      // skip if value only
      if (!object) return

      // apply transform in order provided
      for (var j = 0, l = schema.length; j < l; j++)
        data = transform[schema[j]](data)

      object[key] = data
    }
  }

  const metaSchema = {
    type: 'array',
    items: {
      type: 'string',
      enum: Object.keys(transform),
    }
  }

  const definition = {
    type: 'string',
    errors: false,
    modifying: true,
    valid: true,
    compile,
    metaSchema,
  }

  ajv.addKeyword('sanitize', definition)

  return ajv
}
