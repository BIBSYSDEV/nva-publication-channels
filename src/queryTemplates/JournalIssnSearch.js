'use strict'

const QueryTemplate = require('./QueryTemplate')
const Table = require('./Table')
const Filter = require('./Filter')
const { variableSet, journalProjection } = require('./Common')
const Selection = require('./Selection')
const FilterType = require('./FilterType')
const IssnType = require('./IssnType')

class JournalIssnSearch {
  /**
   * Constructs query for ISSN.
   * @param {String} query The value of the ISSN
   * @param {String} issnType The type of the ISSN
   * @param {String} year
   * @param {Number} size
   * @returns {QueryTemplate}
   */
  constructor (issnType, query, year, size) {
    const selection = new Selection(FilterType.ITEM, [query])
    const variable = variableSet(year)
    const typeVariable = issnType === IssnType.PRINT ? variable.PRINT_ISSN : variable.ONLINE_ISSN
    const filter = new Filter(typeVariable, selection)
    const projection = journalProjection(variable)
    return new QueryTemplate(Table.JOURNAL, [filter], projection, [variable.ORIGINAL_TITLE], size)
  }
}

module.exports = JournalIssnSearch
