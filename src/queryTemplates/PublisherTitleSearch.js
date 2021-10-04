'use strict'

const QueryTemplate = require('./QueryTemplate')
const Table = require('./Table')
const Filter = require('./Filter')
const { variableSet, wildcardQuery, publisherProjection } = require('./Common')
const Selection = require('./Selection')
const FilterType = require('./FilterType')

class PublisherTitleSearch {
  constructor (query, year, size) {
    const selection = new Selection(FilterType.LIKE, [wildcardQuery(query)])
    const variable = variableSet(year)
    const filter = new Filter(variable.ORIGINAL_TITLE, selection)
    return new QueryTemplate(
      Table.PUBLISHER,
      [filter],
      publisherProjection(variable),
      [variable.ORIGINAL_TITLE],
      size
    )
  }
}

module.exports = PublisherTitleSearch
