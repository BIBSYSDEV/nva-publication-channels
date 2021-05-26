const ProblemDocument = require('http-problem-details').ProblemDocument
const httpStatus = require('http-status-codes')
const logger = require('pino')({ useLevelLabels: true })

logger.info('Logger initialized')

const routes = ['/journal', '/publisher']

exports.handler = async (event, context) => {
  if (isInvalidEvent(event)) {
    return errorResponse(createInternalServerErrorDetails(), event)
  }
  return isValidRequest(event) ? responseWithEmptyBody() : errorResponse(createErrorDetails(event), event)
}

const errorResponse = (response, event) => {
  return {
    statusCode: response.code,
    headers: {
      'Content-Type': 'application/problem+json',
      'x-amzn-ErrorType': response.code
    },
    isBase64Encoded: false,
    body: JSON.stringify(
      new ProblemDocument(
        {
          status: response.code,
          detail: response.message,
          instance: getProblemInstance(event)
        }
      )
    )
  }
}

const responseWithEmptyBody = () => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    isBase64Encoded: false,
    body: '{}'
  }
}

const isInvalidEvent = (event) => !(hasPath(event) && 'httpMethod' in event)

const isGetMethod = (event) => event.httpMethod.toUpperCase() === 'GET'

const hasPath = (event) => 'path' in event

const getProblemInstance = (event) => {
  if (!hasPath(event)) {
    return 'Undefined path'
  }
  return 'queryStringParameters' in event ? `${event.path}?${event.queryStringParameters}` : event.path
}

const hasQueryParameters = (event) => Object.prototype.hasOwnProperty.call(event, 'queryStringParameters') && (event.queryStringParameters !== null)

const isValidRequest = (event) => routes.includes(event.path) && isGetMethod(event) && hasValidQuery(event)

const hasValidQuery = (event) => !hasQueryParameters(event) || hasValidQueryParameters(event)

const createNotFoundDetails = (event) => {
  return { code: httpStatus.NOT_FOUND, message: `The requested resource ${event.path} could not be found` }
}

const createMethodNotAllowedDetails = (event) => {
  return { code: httpStatus.METHOD_NOT_ALLOWED, message: `The requested http method  ${event.httpMethod} is not supported` }
}

const createInternalServerErrorDetails = () => {
  return { code: httpStatus.INTERNAL_SERVER_ERROR, message: 'Your request cannot be processed at this time due to an internal server error' }
}

const createBadRequestDetails = (event) => {
  return { code: httpStatus.BAD_REQUEST, message: `Your request cannot be processed because the supplied parameter(s) ${event.queryStringParameters} cannot be understood` }
}

const createErrorDetails = (event) => isGetMethod(event) ? problemsWithGetMethod(event) : createMethodNotAllowedDetails(event)

const problemsWithGetMethod = event => hasQueryParameters(event) ? createBadRequestDetails(event) : createNotFoundDetails(event)

const hasValidQueryParameters = (event) => {
  const querySpec = [{ name: 'query', required: true }, { name: 'year', required: false }, { name: 'start', required: false }]
  const queryStringKeys = Object.keys(event.queryStringParameters)
  return isValidParameterName(queryStringKeys, querySpec) && hasRequiredParameters(queryStringKeys, querySpec) && hasValidParameterValues(event.queryStringParameters)
}

const isValidParameterName = (actualKeys, querySpec) => actualKeys.every(key => querySpec.map(param => param.name).includes(key))

const hasRequiredParameters = (actualKeys, querySpec) => {
  const required = querySpec.filter(param => param.required === true).map(param => param.name)
  return required.every(item => actualKeys.includes(item))
}

const cleanValuesLength = queryStringParameters => Object.values(queryStringParameters).filter(value => value !== undefined).filter(value => value !== null).map(value => value.toString()).filter(value => value !== '').length

const hasValidParameterValues = queryStringParameters => Object.values(queryStringParameters).length === Object.keys(queryStringParameters).length && Object.values(queryStringParameters).length === cleanValuesLength(queryStringParameters)
