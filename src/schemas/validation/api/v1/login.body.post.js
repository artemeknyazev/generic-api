const joi = require('src/helpers/validate/joi')

module.exports = joi.object().keys({
  email: joi.string().email().required(),
  password: joi.string().required(),
})
