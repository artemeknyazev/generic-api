const { joi, ValidationError } = require('src/helpers')

async function validateParticipants(req) {
  if (!req.body || !req.body.hasOwnProperty('participants')) {
    return
  }

  // NOTE: some participants may have 'removed' status; let them be valid for now
  const { User } = req.app.get('models')
  const { participants } = req.body
  const users = await User.findByIds(participants).exec()
  const validParticipants = users.map(user => user.id)
  if (validParticipants.length !== participants.length) {
    const invalidParticipants = participants
      .filter(id => !validParticipants.includes(id))
      .map(id => `${id}`)
      .join(', ')
    throw new ValidationError(`"participants" field contains invalid user ids: ${invalidParticipants}`)
  }
}

module.exports = {
  bodySchema: joi.object().keys({
    title: joi.string().trim().min(1).max(256).escape(),
    participants: joi.array().items(joi.string().objectId()),
  }),
  bodyAsync: [
    validateParticipants,
  ],
}
