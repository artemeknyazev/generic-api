const parent = require('./global')

module.exports = {
  ...parent,
  // Prevent conflicts on dev machine with running dev server
  httpPort: 8001,
  httpsPort: 8002,
}
