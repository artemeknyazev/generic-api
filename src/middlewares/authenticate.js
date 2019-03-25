const jwt = require('jsonwebtoken')
const createHttpError = require('http-errors')

module.exports = function authenticateMiddleware(req, res, next) {
  const token = req.header('x-generic-api-auth-token')
  if (!token) {
    return next(createHttpError(401, 'No access token provided in X-Generic-Api-Auth-Token header'))
  }

  const jwtPrivateKey = req.app.get('__JWT_PRIVATE_KEY__')
  jwt.verify(token, jwtPrivateKey, async function (err, tokenPayload) {
    if (err) {
      return next(err)
    }

    const { User } = req.app.get('models')
    const user = await User.findById(tokenPayload._id)
    if (!user) {
      return next(createHttpError(401, 'Unknown user'))
    }
    req.user = user

    next()
  })
}
