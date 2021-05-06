const AWS = require('aws-sdk')
// Create client outside of handler to reuse
const lambda = new AWS.Lambda()

// Handler
exports.handler = async function (event, context) {
    try {
        let queryParameters = await getQueryParameters(event)
        return formatResponse(serialize(queryParameters))
    } catch (error) {
        return formatError(error)
    }
}

var formatResponse = function (body) {
    var response = {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "isBase64Encoded": false,
        "body": body
    }
    return response
}

var formatError = function (error) {
    var response = {
        "statusCode": error.statusCode,
        "headers": {
            "Content-Type": "text/plain",
            "x-amzn-ErrorType": error.code
        },
        "isBase64Encoded": false,
        "body": error.code + ": " + error.message
    }
    return response
}
// Use SDK client
var getQueryParameters = function (event) {
    return {query: event.query}
}

var serialize = function (object) {
    return JSON.stringify(object, null, 2)
}
