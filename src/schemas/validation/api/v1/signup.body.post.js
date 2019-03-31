const joi = require('src/helpers/validate/joi')

module.exports = joi.object().keys({
  name: joi.string().trim().min(1).max(128).escape(),
  email: joi.string().email().min(3).max(256).required(),
  password: joi.string().min(6).max(256).required(),
})
