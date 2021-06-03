const fs = require('fs')

const journalTemplate = 'queryTemplates/query_journal_template.json'
const publisherTemplate = 'queryTemplates/query_publisher_template.json'

class Request {
  constructor (event) {
    this._request = this.createRequest(event)
  }

  get request () {
    return this._request
  }

  set request (request) {
    this._request = request
  }

  createRequest (event) {
    const template = isJournalQuery(event) ? readTemplate(journalTemplate) : readTemplate(publisherTemplate)
    const wrappedSearchValue = hasQueryParameters(event) ? addWildcardCharacterBeforeAndAfterSearchTerm(event) : SQL_WILDCARD_CHARACTER
    return updateQueryValuesInSearchTemplate(template, wrappedSearchValue)
  }
}

const SQL_WILDCARD_CHARACTER = '%'
const FIRST_FILTER_INDEX = 0
const FIRST_VALUE_INDEX = 0

const hasQueryParameters = (event) => !!event.queryStringParameters && !!event.queryStringParameters.query

const updateQueryValuesInSearchTemplate = (template, filterValue) => {
  template.filter[FIRST_FILTER_INDEX].selection.values[FIRST_VALUE_INDEX] = filterValue
  return template
}

const addWildcardCharacterBeforeAndAfterSearchTerm = event => SQL_WILDCARD_CHARACTER + event.queryStringParameters.query + SQL_WILDCARD_CHARACTER
const isJournalQuery = event => event.path === '/journal'

const readTemplate = (path) => JSON.parse(fs.readFileSync(path).toString())

module.exports = { Request }
