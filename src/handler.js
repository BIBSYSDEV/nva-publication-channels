const ProblemDocument = require('http-problem-details').ProblemDocument
const httpStatus = require('http-status-codes')
const logger = require('pino')({ useLevelLabels: true })

logger.info('Logger initialized')

const routes = ['/journal', '/publisher']

exports.handler = async (event, context) => {
  if (isInvalidValidEvent(event)) {
    return errorResponse(createInternalServerErrorDetails(), event)
  }
  return isValidRequest(event) ? responseWithEmptyBody() : errorResponse(createErrorDetails(event), event)
}

const errorResponse = (response, event) => {
  const path = 'path' in event ? event.path : 'Undefined path'
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
          instance: path
        }
      )
    )
  }
}

const responseWithEmptyBody = () => {
  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    isBase64Encoded: false,
    body: '{}'
  }
  return response
}

const isInvalidValidEvent = (event) => !('path' in event && 'httpMethod' in event)
const isValidRequest = (event) => routes.includes(event.path) && event.httpMethod.toUpperCase() === 'GET'
const createNotFoundDetails = (event) => {
  return { code: httpStatus.NOT_FOUND, message: `The requested resource ${event.path} could not be found` }
}

const createMethodNotAllowedDetails = (event) => {
  return { code: httpStatus.METHOD_NOT_ALLOWED, message: `The requested http method  ${event.httpMethod} is not supported` }
}

const createInternalServerErrorDetails = () => {
  return { code: httpStatus.INTERNAL_SERVER_ERROR, message: 'Your request cannot be processed at this time due to an internal server error' }
}

function createErrorDetails (event) {
  return (event.httpMethod.toUpperCase() !== 'GET') ? createMethodNotAllowedDetails(event) : createNotFoundDetails(event)
}
