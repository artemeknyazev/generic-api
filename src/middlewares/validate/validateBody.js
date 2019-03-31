const joi = require('src/helpers/validate/joi')
const JoiValidationError = require('src/helpers/validate/JoiValidationError')

// Validation&sanitization middleware for req.body
// NOTE: will directly modify req.body

module.exports = function createValidateBodyMiddleware(schema) {
  if (!schema) {
    throw new Error('createValidateBodyMiddleware requries one argument')
  }

  return function validateBodyMiddleware(req, res, next) {
    const schemas = req.app.get('validation') || {}
    const actualSchema = schemas.hasOwnProperty(schema)
      ? schemas[schema] // treat `schema` param as and id of a schema
      : schema // treat `schema` para as an object containing actual schema

    const { error, value } = joi.validate(req.body, actualSchema,
      { allowUnknown: false, abortEarly: false })

    if (error) {
      return next(new JoiValidationError(error))
    }

    req.body = value
    next()
  }
}
