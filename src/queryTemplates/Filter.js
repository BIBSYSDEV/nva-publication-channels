'use strict'

class Filter {
  /**
     * Constructs a Filter.
     * @param {String} variable
     * @param {Selection} selection
     * @returns {Filter}
     */
  constructor (variable, selection) {
    return {
      variabel: variable,
      selection: selection
    }
  }
}

module.exports = Filter
