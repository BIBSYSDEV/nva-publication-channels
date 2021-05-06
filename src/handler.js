exports.handler = async function (event, context) {
  try {
    const queryParameters = getQueryParameters(event)
    console.log('incoming queryParameters=' + JSON.stringify(queryParameters))
    return formatResponse(serialize({}))
  } catch (error) {
    return formatError(error)
  }
}

const formatResponse = function (body) {
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

const formatError = function (error) {
  const response = {
    statusCode: error.statusCode,
    headers: {
      'Content-Type': 'text/plain',
      'x-amzn-ErrorType': error.code
    },
    isBase64Encoded: false,
    body: error.code + ': ' + error.message
  }
  return response
}
// Use SDK client
const getQueryParameters = function (event) {
  return { query: event.query }
}

const serialize = function (object) {
  return JSON.stringify(object, null, 2)
}
