// const { STATUS_CODES } = require('http')
const createError = require('http-errors')
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

router.all('*', function(req, res, next) {
  next(createError(405))
})

router.use(function (err, req, res, next) { // eslint-disable-line no-unused-vars
  let statusCode = 500
  let payload = 'Internal Server Error'
  if (err) {
    statusCode = err.statusCode
    payload = err.message
  }
  res.status(statusCode)
  res.send({
    status: 'error',
    payload,
  })
})

module.exports = router
