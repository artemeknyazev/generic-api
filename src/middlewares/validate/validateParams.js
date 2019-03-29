const createValidateReqPart = require('./createValidateReqPart')

// Validation&sanitization middleware for req.params
// NOTE: will directly modify req.params during sanitizing
// NOTE: allow values that are not in a validation schema, hence 'false'

module.exports = createValidateReqPart('params', false)
