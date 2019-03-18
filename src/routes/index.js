const express = require('express')
const router = express.Router()

router.use('/api', require('./api'))

router.use((req, res) => {
  res.status(404)
  res.send({})
})

module.exports = router
