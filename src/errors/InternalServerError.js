class InternalServerError extends Error {
  constructor () {
    super('Internal server error. Contact site administrator')
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = InternalServerError
