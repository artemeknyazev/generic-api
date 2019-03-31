const joi = require('src/helpers/validate/joi')

module.exports = joi.object().keys({
  title: joi.string().trim().min(1).max(256).escape(),
  participants: joi.array().items(joi.string().objectId()),
})
