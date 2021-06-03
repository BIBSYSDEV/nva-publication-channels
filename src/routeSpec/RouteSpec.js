'use strict'
const QueryParameter = require('./QueryParameter')
const fs = require('fs')
const PathDefinitionError = require('../errors/PathDefinitionError')
const VALID_METHODS = require('./Constants')
const MethodDefinitionError = require('../errors/MethodDefinitionError')
const QueryParameterDefinitionError = require('../errors/QueryParameterDefinitionError')
const PathParametersDefinitionError = require('../errors/PathParametersDefinitionError')
const _URI_SEGMENT_REGEX = '([a-zA-Z0-9\\$\\-_\\@\\.&\\+\\-\\!*"\'\\(\\)\\,](\\%[0-9a-fA-F]{2})?)+'
const _PATH_PARAM_REGEX = `^${_URI_SEGMENT_REGEX}$`
const _PATH_REGEX = `^\\/${_URI_SEGMENT_REGEX}$`
const pathsIsValid = path => path.match(_PATH_REGEX)
const methodIsValid = method => VALID_METHODS.includes(method.toUpperCase())
const convertNullToArray = input => (input === null || input === undefined) ? [] : input
const isValidPathParametersDefinition = pathParameters => convertNullToArray(pathParameters).every(param => param.match(_PATH_PARAM_REGEX))
const isValidQueryParametersDefinition = queryParameters => convertNullToArray(queryParameters).every(param => param instanceof QueryParameter)
const getPath = path => pathsIsValid(path) ? path : (() => { throw new PathDefinitionError(path) })()
const getMethod = method => methodIsValid(method) ? method.toUpperCase() : (() => { throw new MethodDefinitionError(method) })()
const getPathParameters = pathParameters => isValidPathParametersDefinition(pathParameters) ? convertNullToArray(pathParameters) : (() => { throw new PathParametersDefinitionError(pathParameters) })()
const getQueryParameters = queryParameters => isValidQueryParametersDefinition(queryParameters) ? convertNullToArray(queryParameters) : (() => { throw new QueryParameterDefinitionError(queryParameters) })()
const getTemplate = template => fs.existsSync(template) ? template : (() => { throw new Error('Bad template definition: ' + template) })()

class RouteSpec {
  /**
   * Defines a route and the parameters that can be used with the route.
   * @param {String} path
   * @param {String} method
   * @param {Array.<String>} pathParameters
   * @param {Array.<QueryParameter>} queryParameters
   * @param {String} template
   */
  constructor (path, method, pathParameters, queryParameters, template) {
    this._path = getPath(path)
    this._method = getMethod(method)
    this._pathParameters = getPathParameters(pathParameters)
    this._queryParameters = getQueryParameters(queryParameters)
    this._template = getTemplate(template)
  }

  get template () {
    return this._template
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

  get method () {
    return this._method
  }

  get path () {
    return this._path
  }
}

module.exports = RouteSpec
