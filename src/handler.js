class GeneralError extends Error {
  constructor (message, code) {
    super(message)
    this.code = code
    this.errorMessage = message
    this.errorType = 'severe'
  }
}

exports.handler = async function (event, context) {
  try {
    throwGeneralError()
  } catch (error) {
    console.log(error)
    return generateErrorResponse(error)
  }
}

const generateErrorResponse = function (error) {
  const response = {
    statusCode: error.statusCode,
    headers: {
      'Content-Type': 'application/problem+json',
      'x-amzn-ErrorType': error.code
    },
    isBase64Encoded: false,
    body: JSON.stringify(error)
  }
  return response
}

const throwGeneralError = function (event) {
  throw new GeneralError('Eternal server error', 500)
}
