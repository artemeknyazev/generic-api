module.exports = {
  type: 'object',
  properties: {
    'name': {
      type: 'string',
      'allOf': [
        { transform: [ 'trim' ] },
        { minLength: 1, maxLength: 128 },
        { sanitize: [ 'escape' ] },
      ],
    },
  }
}
