class InternalServerError extends Error {
  constructor () {
    super('Internal server error. Contact site administrator')
  }
}

module.exports = InternalServerError
