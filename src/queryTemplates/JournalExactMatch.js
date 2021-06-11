'use strict'

const QueryTemplate = require('./QueryTemplate')
const Table = require('./Table')
const Filter = require('./Filter')
const { variableSet, journalProjection } = require('./Common')
const Selection = require('./Selection')
const FilterType = require('./FilterType')
const SINGLE_VALUE = 1

class JournalExactMatch {
  constructor (identifier, year) {
    const selection = new Selection(FilterType.ITEM, [identifier])
    const variable = variableSet(year)
    const filter = new Filter(variable.JOURNAL_ID, selection)
    return new QueryTemplate(
      Table.JOURNAL,
      [filter],
      journalProjection(variable),
      [variable.ORIGINAL_TITLE],
      SINGLE_VALUE
    )
  }
}

module.exports = JournalExactMatch
