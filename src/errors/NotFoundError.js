class NotFoundError extends Error {
  constructor (event) {
    const pathParameters = event.pathParameters
      ? event.pathParameters.map(param => Object.values(param)).map(param => '/' + param)
      : ''
    super(`The resource '${event.path + pathParameters}' was not found`)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = NotFoundError
