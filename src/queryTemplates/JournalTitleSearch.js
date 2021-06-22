'use strict'

const QueryTemplate = require('./QueryTemplate')
const Table = require('./Table')
const Filter = require('./Filter')
const { variableSet, wildcardQuery } = require('./Common')
const Selection = require('./Selection')
const FilterType = require('./FilterType')

class JournalTitleSearch {
  constructor (query, year, size) {
    const selection = new Selection(FilterType.LIKE, [wildcardQuery(query)])
    const variable = variableSet(year)
    const filter = new Filter(variable.ORIGINAL_TITLE, selection)
    const projection = [
      variable.JOURNAL_ID,
      variable.ORIGINAL_TITLE,
      variable.ONLINE_ISSN,
      variable.PRINT_ISSN,
      variable.OPEN_ACCESS,
      variable.LANGUAGE,
      variable.NPI_DOMAIN,
      variable.WEBSITE,
      variable.LEVEL,
      variable.ACTIVE,
      variable.PUBLISHER,
      variable.PUBLISHER_ID
    ]
    return new QueryTemplate(Table.JOURNAL, [filter], projection, [variable.ORIGINAL_TITLE], size)
  }
}

module.exports = JournalTitleSearch
