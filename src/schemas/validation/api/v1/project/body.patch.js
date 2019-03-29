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
    'slug': {
      type: 'string',
      'allOf': [
        { transform: [ 'trim' ] },
        { minLength: 1, maxLength: 256 },
        { sanitize: [ 'escape' ] },
      ],
    },
    'participants': {
      type: 'array',
      items: {
        type: 'string',
        format: 'object-id',
      }
    }
  }
}
