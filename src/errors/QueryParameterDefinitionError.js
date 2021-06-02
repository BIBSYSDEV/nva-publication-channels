class QueryParameterDefinitionError extends Error {
  constructor (queryParameters) {
    super(`Invalid query parameters definition: ${JSON.stringify(queryParameters)}. Should be an array of QueryParameters`)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = QueryParameterDefinitionError
