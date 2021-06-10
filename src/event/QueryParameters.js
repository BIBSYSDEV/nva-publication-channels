'use strict'

const numericOnly = /^[0-9]+$/
const allowedParameters = ['query', 'year']
const hasQuery = parameters => 'query' in parameters && typeof parameters.query === 'string'
const hasYear = parameters => 'year' in parameters && numericOnly.test(parameters.year.toString())
const validateQuery = parameters => hasQuery(parameters) ? parameters.query : undefined
const validateYear = parameters => hasYear(parameters) ? parameters.year : undefined

class QueryParameters {
  constructor (parameters) {
    this._query = validateQuery(parameters)
    this._year = validateYear(parameters)
    this._original = parameters != null ? parameters : undefined
    this._hasUnknown = Object.keys(parameters).filter(item => !allowedParameters.includes(item)).length !== 0
  }

  get query () {
    return this._query
  }

  get year () {
    return this._year
  }

  get original () {
    return this._original
  }

  get queryParameterString () {
    return this._original !== undefined
      ? '?' + Object.entries(this.original).map(([key, value]) => `${key}=${value}`).join('&')
      : ''
  }

  get isValid () {
    return this._query !== undefined && this._year !== undefined && this._hasUnknown === false
  }
}

module.exports = QueryParameters
