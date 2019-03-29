const createValidateReqPart = require('./createValidateReqPart')

// Validation&sanitization middleware for req.body
// NOTE: will directly modify req.body

module.exports = createValidateReqPart('body')
