'use strict'
const QueryTemplate = require('./QueryTemplate')
const Table = require('./Table')
const Filter = require('./Filter')
const { variableSet, publisherProjection } = require('./Common')
const Selection = require('./Selection')
const FilterType = require('./FilterType')
const SINGLE_VALUE = 1

class PublisherExactMatch {
  constructor (identifier, year) {
    const selection = new Selection(FilterType.ITEM, [identifier])
    const variable = variableSet(year)
    const filter = new Filter(variable.PUBLISHER_ID, selection)
    return new QueryTemplate(
      Table.PUBLISHER,
      [filter],
      publisherProjection(variable),
      [variable.ORIGINAL_TITLE],
      SINGLE_VALUE
    )
  }
}

module.exports = PublisherExactMatch
