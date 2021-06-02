'use strict'

class Routes {
  /**
   * Declares all of the Route specifications for the application
   * @param {Array.<RouteSpec>} routeSpecs
   */
  constructor (routeSpecs) {
    this._routeSpecs = routeSpecs
  }

  /**
   * Matches events with matching Route specifications.
   * @param {Object} event An AWS event
   * @returns {RouteSpec} If a match is found
   * @throws {Error} If no match is found
   */
  matches (event) {
    const pathMatches = this._routeSpecs.filter(spec => this._hasPath(event, spec))
    if (pathMatches.length < 1) throw new Error('Not Found')

    const methodMatches = pathMatches.filter(spec => this._hasMethod(event, spec))
    if (methodMatches.length < 1) throw new Error('Method Not Allowed')

    const pathParamsMatches = methodMatches.filter(spec => this._hasPathParams(event, spec))
    if (pathParamsMatches.length < 1) throw new Error('Not Found')

    const queryMatches = pathParamsMatches.filter(spec => this._hasQueryParams(event, spec))
    if (queryMatches < 1) throw new Error('Bad Request')

    if (queryMatches.length !== 1) {
      throw new Error('Internal server error')
    }

    return pathMatches[0]
  }

  _hasPath (event, route) {
    return route.path === event.path
  }

  _hasMethod (event, route) {
    return route.methods.includes(event.httpMethod)
  }

  _hasPathParams (event, spec) {
    const paramNames = Object.keys(event.pathParameters || []).sort()
    return this._arraysEqual(spec.pathParameters, paramNames) === true
  }

  _hasQueryParams (event, spec) {
    const paramNames = Object.keys(event.queryStringParameters || [])
    return paramNames.every(param => spec.queryParameters.includes(param)) && spec.obligatoryQueryParameters.every(param => paramNames.includes(param))
  }

  _arraysEqual (array1, array2) {
    const array2Sorted = array2.slice().sort()
    return array1.length === array2.length && array1.slice().sort().every((value, index) => {
      return value === array2Sorted[index]
    })
  }
}

module.exports = Routes
