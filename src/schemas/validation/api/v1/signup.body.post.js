module.exports = {
  type: 'object',
  required: [ 'email', 'password' ],
  properties: {
    'name': {
      type: 'string',
      'allOf': [
        { transform: [ 'trim' ] },
        { minLength: 1, maxLength: 128 },
        { sanitize: [ 'escape' ] },
      ],
    },
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
