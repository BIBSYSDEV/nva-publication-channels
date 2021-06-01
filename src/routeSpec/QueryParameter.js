'use strict'

class QueryParameter {
  /**
     * Defines a query parameter for a route.
     * @param {String} name
     * @param {Boolean} required
     */
  constructor (name, required) {
    this._name = name
    this._required = required
  }

  get required () {
    return this._required
  }

  get name () {
    return this._name
  }
}

module.exports = QueryParameter
