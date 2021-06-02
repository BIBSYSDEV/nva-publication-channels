class MethodNotAllowedError extends Error {
  constructor (event) {
    const pathParameters = event.pathParameters instanceof Object && !Array.isArray(event.pathParameters)
      ? Object.values(event.pathParameters).map(param => '/' + param).join('')
      : ''
    super(`Method '${event.httpMethod}' not allowed for resource '${event.path + pathParameters}'`)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = MethodNotAllowedError
