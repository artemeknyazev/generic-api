const http = require('http')

module.exports = () =>
  listener =>
    http.createServer(listener)