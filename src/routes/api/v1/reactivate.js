const express = require('express')
const createHttpError = require('http-errors')
const router = express.Router()

router.post(
  '/',

  async (req, res, next) => {
    req.app.get('logger').error('Called not implemented /api/v1/reactivate')
    next(createHttpError(501))
  },
)

module.exports = router
