const mongoose = require('mongoose')
mongoose.Promise = global.Promise

module.exports = async (connStr) =>
  mongoose.connect(connStr, { useNewUrlParser: true })
