class BadRequestError extends Error {
  constructor (event, routeSpec) {
    const pathParameters = event.pathParameters instanceof Object && !Array.isArray(event.pathParameters)
      ? Object.values(event.pathParameters).map(param => '/' + param).join('')
      : ''
    const path = event.path
    const actualQueryParams = Object.keys(event.queryStringParameters)
    const additional = actualQueryParams.filter(param => !routeSpec.queryParameters.includes(param))
    const additionalMessage = additional.length !== 0 ? `, allowed query parameters: ${JSON.stringify(routeSpec.queryParameters)}, provided: ${JSON.stringify(additional)}` : ''
    const missing = routeSpec.obligatoryQueryParameters.filter(param => !actualQueryParams.includes(param))
    const missingMessage = missing.length !== 0 ? `, missing required parameter(s) ${JSON.stringify(missing)} ` : ''
    const message = `Bad request for resource '${path + pathParameters}'${missingMessage}${additionalMessage}.`
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = BadRequestError
