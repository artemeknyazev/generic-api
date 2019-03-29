const https = require('https')
const {
  readFileSync,
  existsSync,
} = require('fs')

module.exports = (httpsKeyPath, httpsCertPath, httpsPassPath) =>
  listener => {
    if (!existsSync(httpsKeyPath))
      throw new Error(`Couldn't find private key file in ${httpsKeyPath}`)
    if (!existsSync(httpsCertPath))
      throw new Error(`Couldn't find certificate file in ${httpsCertPath}`)
    if (!existsSync(httpsPassPath))
      throw new Error(`Couldn't find passphrase file in ${httpsPassPath}`)

    const credentials = {
      key: readFileSync(httpsKeyPath, 'utf-8'),
      cert: readFileSync(httpsCertPath, 'utf-8'),
      passphrase: readFileSync(httpsPassPath, 'utf-8'),
    }
    return https.createServer(credentials, listener)
  }
