const jwt = require('jsonwebtoken')

// Soft means it will try to authenticate and set auth result in req.isAuthenticated
function authenticateMiddleware(req, res, next) {
  // At first mark request as not authenticated
  req.isAuthenticated = false

  // JWT token can be in header and in cookie
  const headerToken = req.header('x-generic-api-auth-token')
  const cookieToken = req.cookies['generic-api-auth-token']
  const token = headerToken || cookieToken

  // Try verify token
  const jwtPrivateKey = req.app.get('__JWT_PRIVATE_KEY__')
  jwt.verify(token, jwtPrivateKey, async function (err, tokenPayload) {
    // Token can't be verified
    if (err) {
      return next()
    }

    const { User } = req.app.get('models')
    const user = await User.findActiveById(tokenPayload._id)
    // Token is ok, but user can't be found
    if (!user) {
      return next()
    }

    // Authentication succeded
    req.user = user
    req.isAuthenticated = true
    next()
  })
}

module.exports = authenticateMiddleware
