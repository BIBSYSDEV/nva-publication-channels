class NotFoundError extends Error {
  constructor (event) {
    const pathParameters = event.pathParameters instanceof Object && !Array.isArray(event.pathParameters)
      ? Object.values(event.pathParameters).map(param => '/' + param).join('')
      : ''
    super(`The resource '${event.path + pathParameters}' was not found`)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = NotFoundError
