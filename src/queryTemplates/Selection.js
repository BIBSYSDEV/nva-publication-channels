'use strict'

class Selection {
  /**
     * Constructs a selection.
     * @param {String} filter
     * @param {Array.<String>} values
     * @returns {{filter, values}}
     */
  constructor (filter, values) {
    return {
      filter: filter,
      values: values
    }
  }
}

module.exports = Selection
