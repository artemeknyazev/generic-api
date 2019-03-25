const createValidateReqPart = require('./createValidateReqPart')

// Validation&sanitization middleware for req.params
// NOTE: will directly modify req.params

module.exports = createValidateReqPart('params')
