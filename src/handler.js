const ProblemDocument = require('http-problem-details').ProblemDocument
const NotFoundError = require('./error/NotFoundError')
const httpStatus = require('http-status-codes')
const logger = require('pino')({ useLevelLabels: true })

logger.info('Logger initialized')
exports.handler = async (event, context) => {
  try {
    return findRoute(event)
  } catch (err) {
    const code = err.name === 'NotFoundError' ? httpStatus.NOT_FOUND : httpStatus.INTERNAL_SERVER_ERROR
    return errorResponse(code, err.message, event)
  }
}

const routes = []

const findRoute = (event) => {
  if ('path' in event && !routes.includes(event.path)) {
    throw new NotFoundError(`The requested resource ${event.path} could not be found`)
  } else {
    throw new Error('Your request cannot be processed at this time due to an internal server error')
  }
}

const errorResponse = (errorCode, detail, event) => {
  const path = 'path' in event ? event.path : 'Undefined path'
  return {
    statusCode: errorCode,
    headers: {
      'Content-Type': 'application/problem+json',
      'x-amzn-ErrorType': errorCode
    },
    isBase64Encoded: false,
    body: JSON.stringify(
      new ProblemDocument(
        {
          status: errorCode,
          detail: detail,
          instance: path
        }
      )
    )
  }
}
