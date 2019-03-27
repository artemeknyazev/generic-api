const express = require('express')
const router = express.Router()
const { validateBody } = require('src/middlewares')

// Show user info for currently logged in user
router.get(
  '/',

  (req, res) => {
    res.status(200)
    res.sendApiOk(req.user.toJSON())
  }
)

// Edit user info for currently logged in user
router.patch(
  '/',

  validateBody('user-body-patch'),
  async (req, res) => {
    const { User } = req.app.get('models')
    // NOTE: For now API resources contain the same arrangement of fields as models
    const user = await User.findByIdAndUpdate(
        req.user._id,
        req.body,
        { new: true },
      )
      .exec()
    res.status(200)
    res.sendApiOk(user.toJSON())
  }
)

// Remove currently logged in user
router.delete(
  '/',

  async (req, res) => {
    const { User } = req.app.get('models')
    await User.removeById(req.user._id)
    // user removed, no content
    res.status(204)
    res.sendApiOk()
  }
)

module.exports = router
