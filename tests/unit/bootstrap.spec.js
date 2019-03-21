const config = require('../../src/config')
const bootstrap = require('../../src/bootstrap')

describe('Bootstrap', () => {
  it('Successfully start and shutdown application', async () => {
    const { shutdown } = await bootstrap(config)
    await shutdown()
  })
})
