const { validate } = require('src/helpers')

// NOTE: validate (and Ajv inside) will directly modify the specified request part

module.exports = function createValidateReqPart(reqPart) {
  if (!['params', 'query', 'body'].includes(reqPart)) {
    throw new Error('createValidateReqPart: reqPart should be one of \'params\', \'query\', \'body\'')
  }

  return function createValidateMiddleware(schema) {
    return function validateMiddleware(req, res, next) {
      if (!schema) {
        throw new Error('createValidateMiddleware requires exactly one argument')
      }

      const schemas = req.app.get('validation') || {}
      const actualSchema = schemas.hasOwnProperty(schema)
        ? schemas[schema] // treat `schema` param as and id of a schema
        : schema // treat `schema` para as an object containing actual schema

      const data = req[reqPart]

      return validate(actualSchema, data, next)
    }
  }
}
