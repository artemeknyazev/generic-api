const createValidateReqPart = require('./createValidateReqPart')

// Validation&sanitization middleware for req.query
// NOTE: will directly modify req.params during sanitizing
// NOTE: allow values that are not in a validation schema, hence 'false'

module.exports = createValidateReqPart('query', false)
