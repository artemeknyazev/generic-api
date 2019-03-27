const express = require('express')
const bcrypt = require('bcrypt')
const createHttpError = require('http-errors')
const { validateBody } = require('src/middlewares')

const router = express.Router()

router.post(
  '/',

  validateBody('login-body-post'),
  async (req, res, next) => {
    const { User } = req.app.get('models')
    const { email, password } = req.body

    // NOTE: User.passwordHash field is not selected by default, request explicitly
    const user = await User.findByEmail(email)
      .select('+passwordHash')
      .select('+status')
      .exec()
    if (!user) {
      return next(createHttpError(401, 'Invalid email or password'))
    }
    if (user.status === 'removed') {
      return next(createHttpError(401, 'User were removed. Reactivate using /api/v1/reactivate'))
    }
    const validPassword = await bcrypt.compare(password, user.passwordHash)
    if (!validPassword) {
      return next(createHttpError(401, 'Invalid email or password'))
    }

    const jwtPrivateKey = req.app.get('__JWT_PRIVATE_KEY__')
    user.generateAuthToken(jwtPrivateKey, function(err, token) {
      if (err) {
        return next(err)
      }

      res.status(200)
      res.header('x-generic-api-auth-token', token)
      res.sendApiOk({
        ...user.toJSON(),
        token,
      })
    })
  },
)

module.exports = router
