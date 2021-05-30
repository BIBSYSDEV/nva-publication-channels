'use strict'
const QueryParameter = require('./QueryParameter')
const _VALID_METHODS = ['CONNECT', 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT', 'TRACE']
const _URI_SEGMENT_REGEX = '([a-zA-Z0-9\\$\\-_\\@\\.&\\+\\-\\!*"\'\\(\\)\\,](\\%[0-9]{2})?)+'
const _PATH_PARAM_REGEX = `^${_URI_SEGMENT_REGEX}$`
const _PATH_REGEX = `^\\/${_URI_SEGMENT_REGEX}$`
const isValidPathDefinition = paths => paths.every(path => path.match(_PATH_REGEX))
const isValidMethodDefinition = methods => methods.every(method => _VALID_METHODS.includes(method.toUpperCase()))
const isValidPathParametersDefinition = pathParameters => pathParameters.every(param => param.match(_PATH_PARAM_REGEX))
const isValidQueryParametersDefinition = queryParameters => queryParameters.every(param => param instanceof QueryParameter)
const getPaths = paths => isValidPathDefinition(paths) ? paths : false
const getMethods = methods => isValidMethodDefinition(methods) ? methods.map(method => method.toUpperCase()) : false
const getPathParameters = pathParameters => isValidPathParametersDefinition(pathParameters) ? pathParameters : false
const getQueryParameters = queryParameters => isValidQueryParametersDefinition(queryParameters) ? queryParameters : false

class RouteSpec {
  /**
   * Defines a route and the parameters that can be used with the route.
   * @param {Array.<String>} paths
   * @param {Array.<String>} methods
   * @param {Array.<String>} pathParameters
   * @param {Array.<QueryParameter>} queryParameters
   */
  constructor (paths, methods, pathParameters, queryParameters) {
    this._paths = getPaths(paths) || (() => { throw new Error('Invalid paths definition') })()
    this._methods = getMethods(methods) || (() => { throw new Error('Invalid methods definition') })()
    this._pathParameters = getPathParameters(pathParameters || []) || (() => { throw new Error('Bad path parameters definition') })()
    this._queryParameters = getQueryParameters(queryParameters || []) || (() => { throw new Error('Bad query parameters definition') })()
  }

  get queryParameters () {
    return this._queryParameters.map(param => param.name)
  }

  get pathParameters () {
    return this._pathParameters
  }

  get obligatoryQueryParameters () {
    return this._queryParameters.filter(param => param.required === true).map(param => param.name)
  }

  get methods () {
    return this._methods
  }

  get paths () {
    return this._paths
  }
}

module.exports = RouteSpec
