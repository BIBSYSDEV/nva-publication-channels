
class ClientError extends Error {
  constructor (request, pathParameters, queryParameters) {
    super()
    this._path = request.resource
    this._httpMethod = request.httpMethod
    this._pathParameters = pathParameters
    this._queryParameters = queryParameters
  }

  get path () {
    return this._path
  }

  get queryParameters () {
    return this._queryParameters
  }

  get pathParameters () {
    return this._pathParameters
  }

  get httpMethod () {
    return this._httpMethod
  }

  get fullPath () {
    const queryParamsString = this._queryParameters.queryParameterString
    return this._path
      ? this._path + queryParamsString
      : 'Undefined path'
  }
}

module.exports = ClientError
