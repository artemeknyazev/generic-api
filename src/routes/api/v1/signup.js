const express = require('express')
const bcrypt = require('bcrypt')
const createHttpError = require('http-errors')
const { validate } = require('src/middlewares')

const router = express.Router()

router.post(
  '/',

  validate('signup'),
  async (req, res, next) => {
    const { User } = req.app.get('models')
    const { name, email, password } = req.body

    const existingUser = await User.findByEmail(email)
      .select('+status')
      .exec()
    if (existingUser) {
      if (existingUser.status === 'active') {
        return next(createHttpError(400, 'User already registered'))
      } else if (existingUser.status === 'removed') {
        return next(createHttpError(400, 'User were removed. Reactivate using /api/v1/reactivate'))
      } else {
        // Alert when new status was introduced but we forgot to handle it here
        req.app.get('logger').error(`Signup with an email of an existing user, unknown existing user status '${existingUser.status}'`)
        return next(createHttpError(400, 'User already registered'))
      }
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const newUser = await new User({ name, email, passwordHash }).save()

    res.status(200)
    res.sendApiOk(newUser.toJSON())
  }
)

module.exports = router
