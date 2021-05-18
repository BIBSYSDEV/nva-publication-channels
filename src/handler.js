const ProblemDocument = require('http-problem-details').ProblemDocument
const httpStatus = require('http-status-codes')
const logger = require('pino')({ useLevelLabels: true })

logger.info('Logger initialized')

const routes = []

exports.handler = async (event, context) => {
  return (event.httpMethod === 'OPTIONS') ? optionsResponse() : errorResponse(createErrorResponseDetails(event), event)
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

const createErrorResponseDetails = (event) => isRequestWithPath(event) ? createNotFoundDetails(event) : createInternalServerErrorDetails()

const isRequestWithPath = (event) => 'path' in event && !routes.includes(event.path)

const createNotFoundDetails = (event) => {
  return { code: httpStatus.NOT_FOUND, message: `The requested resource ${event.path} could not be found` }
}

const createInternalServerErrorDetails = () => {
  return { code: httpStatus.INTERNAL_SERVER_ERROR, message: 'Your request cannot be processed at this time due to an internal server error' }
}

const optionsResponse = () => {
  return {
    statusCode: httpStatus.OK,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
    },
    isBase64Encoded: false,
    body: '{}'
  }
}

