'use strict'

const PathParameters = require('./PathParameters')
const QueryParameters = require('./QueryParameters')
const NullQueryParameters = require('./NullQueryParameters')
const NullPathParameters = require('./NullPathParameters')
const ClientError = require('./ClientError')
const isString = candidate => typeof candidate === 'string'
const validatePath = event => 'path' in event && isString(event.path) ? event.path : undefined
const validateMethod = event => 'httpMethod' in event && isString(event.httpMethod)
  ? event.httpMethod.toUpperCase()
  : undefined

const isObject = candidate => candidate instanceof Object && !Array.isArray(candidate)

const isValidPathParameters = event => 'pathParameters' in event && isObject(event.pathParameters)
const validatePathParameters = event => isValidPathParameters(event)
  ? new PathParameters(event.pathParameters)
  : new NullPathParameters()
const isValidQueryParameters = event => 'queryStringParameters' in event && isObject(event.queryStringParameters)
const validateQueryParameters = event => isValidQueryParameters(event)
  ? new QueryParameters(event.queryStringParameters)
  : new NullQueryParameters()

class Event {
  constructor (event) {
    this._path = validatePath(event)
    this._httpMethod = validateMethod(event)
    this._pathParameters = validatePathParameters(event)
    this._queryParameters = validateQueryParameters(event)
    if (!(this.queryParameters.isValid || this.pathParameters.isValid)) {
      throw new ClientError(event, this.pathParameters, this.queryParameters)
    }
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

  get path () {
    return this._path
  }

  get fullPath () {
    const pathParamsString = this._pathParameters.pathParameterString

    const queryParamsString = this._queryParameters.queryParameterString

    return this._path
      ? this._path + pathParamsString + queryParamsString
      : 'Undefined path'
  }

  get isValid () {
    return this._path != null && this._httpMethod != null
  }
}

module.exports = Event
