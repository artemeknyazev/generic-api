const validate = require('src/helpers/validate')

module.exports = (schema) =>
  (req, res, next) =>
    validate(schema, req.body, next)
