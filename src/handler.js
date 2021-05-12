const ProblemDocument = require('http-problem-details').ProblemDocument
const httpStatus = require('http-status-codes')
const logger = require('pino')({
  formatters: {
    level: (label) => {
      return { level: label }
    }
  }
})

const supportedPaths = ['/journal', '/publisher']
const isSupportedHttpMethod = event => 'httpMethod' in event && event.httpMethod.toUpperCase() === 'GET'
const isSupportedPath = event => 'path' in event && supportedPaths.includes(event.path)
const executeSomeFunctionality = () => formatResponse('{}')
const validRequest = (event) => isSupportedPath(event) && isSupportedHttpMethod(event)
const getErrorCode = (event) => !isSupportedPath(event) ? httpStatus.NOT_FOUND : !isSupportedHttpMethod(event) ? httpStatus.METHOD_NOT_ALLOWED : httpStatus.INTERNAL_SERVER_ERROR

logger.info('Logger initialized')

exports.handler = async (event, context) => validRequest(event) ? executeSomeFunctionality() : generateProblemResponse(event, getErrorCode(event))

const generateProblemResponse = (event, errorCode) => {
  const reason = httpStatus.getReasonPhrase(errorCode)
  const detail = `Your request cannot be processed at this time due of '${reason}'`
  const path = event.path
  logger.info(detail, path)
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
          instance: event.path
        }
      ))
  }
}

const formatResponse = (body) => {
  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    isBase64Encoded: false,
    body: body
  }
  return response
}
