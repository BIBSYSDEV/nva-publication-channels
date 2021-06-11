'use strict'

const hasId = parameters => 'id' in parameters && typeof parameters.id === 'string'
const hasYear = parameters => 'year' in parameters && typeof parameters.year === 'string'
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

  get isValid () {
    return this._id !== undefined && this._year !== undefined
  }
}

module.exports = PathParameters
