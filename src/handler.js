const ProblemDocument = require('http-problem-details').ProblemDocument
const httpStatus = require('http-status-codes')
const logger = require('pino')({ useLevelLabels: true })

logger.info('Logger initialized')
exports.handler = async (event, context) => generateProblemResponse(event, httpStatus.INTERNAL_SERVER_ERROR)

const generateProblemResponse = function (event, errorCode) {
  const reason = httpStatus.getReasonPhrase(errorCode)
  const detail = `Your request cannot be processed at this time because of '${reason}'`
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
