class PathParametersDefinitionError extends Error {
  constructor (pathParameters) {
    super(`Bad path parameters definition: ${JSON.stringify(pathParameters)}. The paths should be valid URI segments`)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = PathParametersDefinitionError
