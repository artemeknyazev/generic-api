class ValidationError extends Error {
  constructor(errors) {
    if (errors instanceof ValidationError) {
      return errors
    }

    super()
    if (errors instanceof Error) {
      this.errors = [ errors.message ]
    } else {
      this.errors = Array.isArray(errors) ? errors : [ errors ]
    }
  }

  toJSON() {
    return this.errors
  }

  toString() {
    return `ValidationError: ${this.errors.join(', ')}`
  }
}

module.exports = ValidationError
