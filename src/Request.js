const fs = require('fs')

class Request {
  constructor (event) {
    this.request = this.createRequest(event)
  }

  getRequest () {
    return this.request
  }

  createRequest (event) {
    const template = isJournalQuery(event) ? readTemplate('query_journal_template.json') : readTemplate('query_publisher_template.json')
    const wrappedSearchValue = hasQueryParameters(event) ? addWildcardCharacterBeforeAndAfterSearchTerm(event) : SQL_WILDCARD_CHARACTER
    return updateQueryValuesInSearchTemplate(template, wrappedSearchValue)
  }
}

const SQL_WILDCARD_CHARACTER = '%'
const FIRST_FILTER_INDEX = 0
const FIRST_VALUE_INDEX = 0

const hasQueryParameters = event => event.queryStringParameters !== undefined && event.queryStringParameters.query !== undefined

const updateQueryValuesInSearchTemplate = (template, filterValue) => {
  template.filter[FIRST_FILTER_INDEX].selection.values[FIRST_VALUE_INDEX] = filterValue
  return template
}

const addWildcardCharacterBeforeAndAfterSearchTerm = event => SQL_WILDCARD_CHARACTER + event.queryStringParameters.query + SQL_WILDCARD_CHARACTER
const isJournalQuery = event => event.path === '/journal'

const readTemplate = (path) => JSON.parse(fs.readFileSync(path).toString())

module.exports = { Request }
