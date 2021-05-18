const ProblemDocument = require('http-problem-details').ProblemDocument
const httpStatus = require('http-status-codes')
const logger = require('pino')({ useLevelLabels: true })

logger.info('Logger initialized')

const routes = []

exports.handler = async (event, context) => {
  const response = 'path' in event && !routes.includes(event.path)
    ? { code: httpStatus.NOT_FOUND, message: `The requested resource ${event.path} could not be found` }
    : { code: httpStatus.INTERNAL_SERVER_ERROR, message: 'Your request cannot be processed at this time due to an internal server error' }
  return errorResponse(response, event)
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
