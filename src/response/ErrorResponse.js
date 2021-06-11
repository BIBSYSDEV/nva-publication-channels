const ProblemDocument = require('http-problem-details').ProblemDocument

class ErrorResponse {
  constructor (response, event) {
    this.statusCode = response.code
    this.headers = {
      'Content-Type': 'application/problem+json',
      'x-amzn-ErrorType': response.code
    }
    this.isBase64Encoded = false
    this.body = JSON.stringify(
      new ProblemDocument(
        {
          status: response.code,
          detail: response.message,
          instance: this._getProblemInstance(event)
        }
      )
    )
  }

  _getProblemInstance (event) {
    return event.path ? `${event.fullPath}` : 'Undefined path'
  }

  _hasPath (event) {
    return !!event.path
  }
}

module.exports = ErrorResponse
