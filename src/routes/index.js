const express = require('express')
const router = express.Router({ strict: true })

router.use('/api/v1', require('./api/v1'))

router.get('/', (req, res) => {
  res.status(200)
  res.send('<!DOCTYPE html><html><body><p>Currently we only support API calls. API documentation is available on <a href="https://app.swaggerhub.com/apis/artemeknyazev/generic-api">SwaggerHub</a></p></body></html>')
})

router.all('*', (req, res) => {
  res.sendStatus(404)
})

module.exports = router
