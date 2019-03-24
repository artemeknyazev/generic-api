const Ajv = require('ajv')

// NOTE: In Ajv sync and async validation have different 'interfaces'
// This helper ensures a consistent interface by:
// * in case of success calling callback with arguments (null, <clean data>)
// * or in case of failure calling callback with Ajv.ValidationError
// NOTE: no need to return a Promise, this will be used inside a middleware

module.exports = function validate(schema, data, cb) {
  const ajv = new Ajv({
    // remove fields not present in the schema
    removeAdditional: true,
    // show all errors instead of showing them one-by-one
    allErrors: true,
  })

  const result = ajv.validate(schema, data)

  if (result instanceof Promise) {
    // schema['$async'] === true
    result.then(data => {
      cb(null, data)
    }).catch(err => {
      // here err is already Ajv.ValidationError
      cb(err)
    })
    return
  }

  if (result) {
    cb(null, data)
    return
  }

  cb(new Ajv.ValidationError(ajv.errors))
}
