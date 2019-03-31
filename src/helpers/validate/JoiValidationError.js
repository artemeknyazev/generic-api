class JoiValidationError extends Error {
  constructor(errors) {
    super()
    this.errors = errors
  }

  toJSON() {
    return this.toErrorArray()
  }

  toErrorArray() {
    return this.errors.details.map(({ message }) => message)
  }

  toString() {
    return `JoiValidationError: ${this.toErrorArray.join(', ')}`
  }
}

module.exports = JoiValidationError
