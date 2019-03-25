module.exports = {
  type: 'object',
  required: [ 'email', 'password' ],
  properties: {
    'email': {
      type: 'string',
      transform: [ 'trim' ],
    },
    'password': {
      type: 'string',
    },
  }
}
