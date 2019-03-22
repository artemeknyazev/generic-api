module.exports = (listener, createServer, port) =>
  new Promise((resolve, reject) => {
    const server = createServer(listener)
    server.listen(port, (err) => {
      if (err) {
        return reject(err)
      }
      resolve(server)
    })
  })
