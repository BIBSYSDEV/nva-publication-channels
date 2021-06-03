'use strict'
const QueryParameter = require('./QueryParameter')
const _VALID_METHODS = ['CONNECT', 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT', 'TRACE']
const _URI_SEGMENT_REGEX = '([a-zA-Z0-9\\$\\-_\\@\\.&\\+\\-\\!*"\'\\(\\)\\,](\\%[0-9a-fA-F]{2})?)+'
const _PATH_PARAM_REGEX = `^${_URI_SEGMENT_REGEX}$`
const _PATH_REGEX = `^\\/${_URI_SEGMENT_REGEX}$`
const pathsIsValid = path => path.match(_PATH_REGEX)
const allMethodsAreValid = methods => methods.every(method => _VALID_METHODS.includes(method.toUpperCase()))
const convertNullToArray = input => (input === null || input === undefined) ? [] : input
const isValidPathParametersDefinition = pathParameters => convertNullToArray(pathParameters).every(param => param.match(_PATH_PARAM_REGEX))
const isValidQueryParametersDefinition = queryParameters => convertNullToArray(queryParameters).every(param => param instanceof QueryParameter)
const getPath = path => pathsIsValid(path) ? path : (() => { throw new Error('Invalid path definition') })()
const getMethods = methods => allMethodsAreValid(methods) ? methods.map(method => method.toUpperCase()) : (() => { throw new Error('Invalid methods definition') })()
const getPathParameters = pathParameters => isValidPathParametersDefinition(pathParameters) ? convertNullToArray(pathParameters) : (() => { throw new Error('Bad path parameters definition') })()
const getQueryParameters = queryParameters => isValidQueryParametersDefinition(queryParameters) ? convertNullToArray(queryParameters) : (() => { throw new Error('Bad query parameters definition') })()

class RouteSpec {
  /**
   * Defines a route and the parameters that can be used with the route.
   * @param {String} path
   * @param {Array.<String>} methods
   * @param {Array.<String>} pathParameters
   * @param {Array.<QueryParameter>} queryParameters
   */
  constructor (path, methods, pathParameters, queryParameters) {
    this._path = getPath(path)
    this._methods = getMethods(methods)
    this._pathParameters = getPathParameters(pathParameters)
    this._queryParameters = getQueryParameters(queryParameters)
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

  get path () {
    return this._path
  }
}

module.exports = RouteSpec
