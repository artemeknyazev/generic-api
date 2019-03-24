const Ajv = require('ajv')
const createHttpError = require('http-errors')
const express = require('express')
const router = express.Router()
const { validate } = require('src/middlewares')

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

const signupSchema = {
  '$async': true,
  type: 'object',
  required: [ 'email', 'password' ],
  items: {
    'email': {
      type: 'string',
    },
    'password': {
      type: 'string',
    }
  }
}

router.post('/signup', validate(signupSchema), (req, res) => {
  res.status(200)
  res.send(req.body)
})

router.all('*', function(req, res, next) {
  next(createHttpError(405))
})

router.use(function (err, req, res, next) { // eslint-disable-line no-unused-vars
  let statusCode = 500
  let payload = 'Internal Server Error'
  if (err) {
    if (err instanceof createHttpError.HttpError) {
      statusCode = err.statusCode
      payload = err.message
    } else if (err instanceof Ajv.ValidationError) {
      statusCode = 400 // Bad Request
      payload = err.errors
    }
  }
  res.status(statusCode)
  res.send({
    status: 'error',
    payload,
  })
})

module.exports = router
