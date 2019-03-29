function sendApi(status, payload, meta) {
  return this.send({
    status,
    meta,
    payload,
  })
}

function sendApiOk(payload, meta) {
  return this.sendApi('ok', payload, meta)
}

function sendApiErr(payload, meta) {
  return this.sendApi('error', payload, meta)
}

module.exports = function apiResponseMiddleware(req, res, next) {
  res.sendApi = sendApi
  res.sendApiOk = sendApiOk
  res.sendApiErr = sendApiErr

  next()
}
