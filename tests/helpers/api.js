const request = require('supertest')

const GET = 'GET'
const POST = 'POST'
const PATCH = 'PATCH'
const DELETE = 'DELETE'

function prepareApiResponse(res, reqData = null) {
  const result = {
    res,
    statusCode: res.status,
    status: res.body.status,
    payload: res.body.payload,
  }
  if (result.payload && result.payload.id) {
    result.id = result.payload.id
  }
  if (reqData) {
    result.reqData = reqData
  }
  return result
}

async function apiCall(server, method, url, token = null, data = null) {
  let req = request(server)
  switch (method) {
    case GET:
      req = req.get(url)
      break
    case POST:
      req = req.post(url)
      break
    case PATCH:
      req = req.patch(url)
      break
    case DELETE:
      req = req.delete(url)
      break
    default:
      throw new Error(`Unknown method ${method}`)
  }
  if (token) {
    req = req.set('x-generic-api-auth-token', token)
  }
  return prepareApiResponse(await (
    data ? req.send(data) : req.send()
  ))
}

function apiGet(server, url, token = null) {
  return apiCall(server, GET, url, token)
}

function apiPost(server, url, token = null, data = {}) {
  return apiCall(server, POST, url, token, data)
}

function apiPatch(server, url, token = null, data = {}) {
  return apiCall(server, PATCH, url, token, data)
}

function apiDelete(server, url, token = null) {
  return apiCall(server, DELETE, url, token)
}

module.exports = {
  apiCall,

  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
}
