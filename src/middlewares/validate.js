const { joi, ValidationError } = require('src/helpers')

// Validation&sanitization middleware for req
// NOTE: will directly modify req.body

function createValidationErrorFromJoiError(joiError) {
  // TODO: think about better array valdiation error responses, because
  // now it produces smth like "'0' must be a valid MongoDB ObjectId"
  const errors = joiError.details.map(({ message }) => message)
  return new ValidationError(errors)
}

module.exports = function createValidateMiddleware(validatorId) {
  if (!validatorId) {
    throw new Error('createValidateMiddleware requries one argument')
  }

  return async function validateMiddleware(req, res, next) {
    const validators = req.app.get('validators') || {}
    if (!validators.hasOwnProperty(validatorId)) {
      throw new Error(`Unknown validator '${validatorId}'`)
    }

    const { bodySchema, bodyAsync } = validators[validatorId]

    // Validate&sanitize req.body data synchronously using the provided schema
    // This validator:
    //   * strips all properties that are not mentioned in the schema
    //   * checks value validity according to the schema
    //   * sanitizes values
    if (bodySchema) {
      const { error, value: validatedBody } = joi.validate(req.body, bodySchema,
        { allowUnknown: false, abortEarly: false })

      if (error) {
        return next(createValidationErrorFromJoiError(error))
      }

      req.body = validatedBody
    }

    // Validate req.body data asynchronously
    // These validators:
    //   * check business logic requirements&constraints
    if (bodyAsync) {
      for (const validateRequestBodyFn of bodyAsync) {
        try {
          // NOTE: validators MAY directly modify req.body
          await validateRequestBodyFn(req)
        } catch(err) {
          return next(err)
        }
      }
    }

    next()
  }
}
