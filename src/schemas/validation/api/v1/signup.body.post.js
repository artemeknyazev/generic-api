module.exports = {
  type: 'object',
  required: [ 'email', 'password' ],
  properties: {
    'email': {
      // IMPORTANT: treat emails as case-sensitive!
      type: 'string',
      'allOf': [ // allOf ensures the application order
        { transform: [ 'trim' ] },
        { format: 'email', minLength: 3, maxLength: 128 },
      ],
    },
    'password': {
      type: 'string',
      minLength: 6,
      maxLength: 128,
    },
  }
}
