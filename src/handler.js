const ProblemDocument = require('http-problem-details').ProblemDocument

exports.handler = async function (event, context) {
  return generateProblemResponse(event)
}

exports.handler = async function (event, context) {
  return generateProblemResponse(event)
}

const generateProblemResponse = function (event) {
  const INTERNAL_SERVER_ERROR = 500
  const detail = 'Your request cannot be processed at this time because of an internal server error'
  const path = event.path
  console.log(detail, path)
  return {
    statusCode: INTERNAL_SERVER_ERROR,
    headers: {
      'Content-Type': 'application/problem+json',
      'x-amzn-ErrorType': INTERNAL_SERVER_ERROR
    },
    isBase64Encoded: false,
    body: JSON.stringify(
      new ProblemDocument(
        {
          status: INTERNAL_SERVER_ERROR,
          detail: detail,
          instance: event.path
        }
      ))
  }
}
