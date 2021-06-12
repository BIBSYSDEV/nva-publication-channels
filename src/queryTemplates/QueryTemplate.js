'use strict'

class QueryTemplate {
  /**
     * Constructs a query.
     * @param {Table} table
     * @param {Array.<Filter>} filter
     * @param {Array.<String>} variables
     * @param {Array.<String>} sortBy,
     * @param {number} size
     * @returns {QueryTemplate}
     */
  constructor (table, filter, variables, sortBy, size) {
    return {
      tabell_id: table,
      api_versjon: 1,
      statuslinje: 'N',
      begrensning: size.toString(),
      kodetekst: 'N',
      desimal_separator: '.',
      variabler: variables,
      sortBy: sortBy,
      filter: filter
    }
  }
}

module.exports = QueryTemplate
