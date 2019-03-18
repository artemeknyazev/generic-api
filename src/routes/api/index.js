const express = require('express')
const router = express.Router()

const list = []

router.get('/', (req, res) => {
  res.status(200)
  res.send({
    status: 'ok',
    payload: list,
  })
})

router.post('/', (req, res) => {
  const data = { ...req.body.data }
  list.push(data)
  res.status(201)
  res.send({
    status: 'ok',
    payload: data,
  })
})

router.use((req, res) => {
  res.status(404)
  res.send({
    status: 'error',
    payload: 'Unknown API operation',
  })
})

module.exports = router
