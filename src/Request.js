const fs = require('fs')

const journalTemplate = 'queryTemplates/query_journal_template.json'
const publisherTemplate = 'queryTemplates/query_publisher_template.json'

class Request {
  constructor (event) {
    this._hasPathParameters = !!event.pathParameters
    this._path = event.path
    this._queryStringParameters = event.queryParameters
    this._nsdrequest = this.createRequest(event)
  }

  get nsdRequest () {
    return this._nsdrequest
  }

  get hasPathParameters () {
    return this._hasPathParameters
  }

  get queryStringParameters () {
    return this._queryStringParameters
  }

  get path () {
    return this._path
  }

  createRequest (event) {
    const template = isJournalQuery(event) ? readTemplate(journalTemplate) : readTemplate(publisherTemplate)
    const wrappedSearchValue = addWildcardCharacterBeforeAndAfterSearchTerm(event)
    return updateQueryValuesInSearchTemplate(template, wrappedSearchValue)
  }
}

const SQL_WILDCARD_CHARACTER = '%'
const FIRST_FILTER_INDEX = 0
const FIRST_VALUE_INDEX = 0
const updateQueryValuesInSearchTemplate = (template, filterValue) => {
  template.filter[FIRST_FILTER_INDEX].selection.values[FIRST_VALUE_INDEX] = filterValue
  return template
}

const addWildcardCharacterBeforeAndAfterSearchTerm = (event) => {
  return (event.queryParameters && event.queryParameters.query)
    ? SQL_WILDCARD_CHARACTER + event.queryParameters.query + SQL_WILDCARD_CHARACTER
    : '__IDENTIFIER__'
}
const isJournalQuery = event => event.path === '/journal'

const readTemplate = (path) => JSON.parse(fs.readFileSync(path).toString())

module.exports = Request
