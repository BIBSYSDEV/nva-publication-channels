'use strict'

const hasId = parameters => 'id' in parameters && parameters.id instanceof String
const hasYear = parameters => 'year' in parameters && parameters.year instanceof String
const validateId = parameters => hasId(parameters) ? parameters.id : undefined
const validateYear = parameters => hasYear(parameters) ? parameters.year : undefined

class PathParameters {
  constructor (parameters) {
    this._id = validateId(parameters)
    this._year = validateYear(parameters)
    this._original = parameters
  }

  get id () {
    return this._id
  }

  get year () {
    return this._year
  }

  get original () {
    return this._original
  }
}

module.exports = PathParameters
