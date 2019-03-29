module.exports = {
  type: 'object',
  properties: {
    'title': {
      type: 'string',
      'allOf': [
        { transform: [ 'trim' ] },
        { minLength: 1, maxLength: 256 },
        { sanitize: [ 'escape' ] },
      ],
    },
    'assignedTo': {
      type: 'string',
      format: 'object-id'
    },
  }
}
