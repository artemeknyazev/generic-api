const express = require('express')
const router = express.Router()
const { validateBody } = require('src/middlewares')

// Show user info for currently logged in user
router.get(
  '/',

  (req, res) => {
    res.status(200)
    res.send(req.user.toJSON())
  }
)

// Edit user info for currently logged in user
router.patch(
  '/',

  validateBody('user-body-patch'),
  async (req, res, next) => {
    try {
      const { User } = req.app.get('models')
      // NOTE: API resources contain the same arrangement of fields as models
      const user = await User.findOneAndUpdate(
          { _id: req.user._id },
          req.body,
          { new: true },
        )
        .exec()
      res.status(200)
      res.send(user.toJSON())
    } catch (err) {
      return next(err)
    }
  }
)

module.exports = router
