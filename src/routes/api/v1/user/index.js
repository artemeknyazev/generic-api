const express = require('express')
const router = express.Router()
const { authenticate, validateBody } = require('src/middlewares')

// Show user info for currently logged in user
router.get(
  '/',

  authenticate,
  (req, res) => {
    res.status(200)
    res.send(req.user.toJSON())
  }
)

// Edit user info for currently logged in user
router.patch(
  '/',

  authenticate,
  validateBody('user-body-patch'),
  (req, res) => {
    res.status(200)
    res.send(req.body)
  }
)

module.exports = router
