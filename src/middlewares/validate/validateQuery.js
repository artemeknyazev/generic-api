const createValidateReqPart = require('./createValidateReqPart')

// Validation&sanitization middleware for req.query
// NOTE: will directly modify req.query

module.exports = createValidateReqPart('query')
