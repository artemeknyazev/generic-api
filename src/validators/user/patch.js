const joi = require('src/helpers/validate/joi')

module.exports = {
  bodySchema: joi.object().keys({
    name: joi.string().trim().min(1).max(256).escape(),
  }),
}
