const express = require('express')
const router = express.Router({ strict: true })

router.use('/api', require('./api'))

router.get('/', (req, res) => {
  res.status(200)
  res.send('Currently we only support API calls. Try sending GET request to /api')
})

router.all('*', (req, res) => {
  res.status(404)
  res.send('404 — Unknown path')
})

module.exports = router
