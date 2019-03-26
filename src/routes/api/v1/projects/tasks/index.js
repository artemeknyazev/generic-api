const express = require('express')
const createHttpError = require('http-errors')
const router = express.Router()

router.all('*', (req, res, next) => {
  // TODO: implement
  next(createHttpError(501))
})

module.exports = router
