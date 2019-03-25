const express = require('express')
const bcrypt = require('bcrypt')
const createHttpError = require('http-errors')
const { validateBody } = require('src/middlewares')

const router = express.Router()

router.post(
  '/',

  validateBody('signup-body-post'),
  async (req, res, next) => {
    const { User } = req.app.get('models')
    const { name, email, password } = req.body

    const existingUser = await User.findOne({ email }).exec()
    if (existingUser) {
      return next(createHttpError(400, 'User already registered'))
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const newUser = await new User({ name, email, passwordHash }).save()

    res.status(200)
    res.send({
      status: 'ok',
      payload: newUser.toJSON(),
    })
  }
)

module.exports = router
