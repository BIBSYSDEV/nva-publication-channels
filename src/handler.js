class GeneralError extends Error {
  constructor (code, detail, requestUri) {
    super(detail)
    this.statusCode = code
    this.type = 'about:blank '
    this.title = 'Internal Server Error'
    this.detail = detail
    this.instance = requestUri
  }
}

exports.handler = async function (event, context) {
  let response
  try {
    throwGeneralError(event)
    response = formatResponse('This message should not be visible..')
  } catch (error) {
    console.log(error)
    response = generateErrorResponse(error)
  }
  return response
}

const formatResponse = function (body) {
  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    isBase64Encoded: false,
    body: JSON.stringify(body)
  }
  return response
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
  console.log(event)
  throw new GeneralError(500, 'Your request cannot be processed at this time because of an internal server error', event.path)
}
