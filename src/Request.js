const JournalTitleSearch = require('./queryTemplates/JournalTitleSearch')
const PublisherTitleSearch = require('./queryTemplates/PublisherTitleSearch')
const JournalIssnSearch = require('./queryTemplates/JournalIssnSearch')
const IssnType = require('./queryTemplates/IssnType')
const JournalExactMatch = require('./queryTemplates/JournalExactMatch')
const PublisherExactMatch = require('./queryTemplates/PublisherExactMatch')

class Request {
  constructor (event) {
    this._hasPathParameters = !!event.pathParameters
    this._path = event.path
    this._year = event.pathParameters !== undefined ? event.pathParameters.year : event.queryParameters.year
    this._nsdrequest = this.createRequest(event)
  }

  get requests () {
    return this._nsdrequest
  }

  get hasPathParameters () {
    return this._hasPathParameters
  }

  get year () {
    return this._year
  }

  get path () {
    return this._path
  }

  createRequest (event) {
    const path = event.path
    const query = event.queryParameters !== undefined ? event.queryParameters.query : undefined
    const yearAsQueryParameter = event.queryParameters !== undefined ? event.queryParameters.year : undefined
    const yearAsPathParameter = event.pathParameters !== undefined ? event.pathParameters.year : undefined
    const year = yearAsQueryParameter !== undefined ? yearAsQueryParameter : yearAsPathParameter
    const id = event.pathParameters !== undefined ? event.pathParameters.id : undefined
    // TODO: implement size query parameter
    const size = 10

    const templates = []
    if (isIssnSearch(query)) {
      templates.push(new JournalIssnSearch(IssnType.ONLINE, query, year, size),
        new JournalIssnSearch(IssnType.PRINT, query, year, size))
    } else if (isJournalSearch(path, query, year)) {
      templates.push(new JournalTitleSearch(query, year, size))
    } else if (isPublisherTitleSearch(path, query, year)) {
      templates.push(new PublisherTitleSearch(query, year, size))
    } else if (isJournalExactMatch(path, id, year)) {
      templates.push(new JournalExactMatch(id, year))
    } else if (isPublisherExactMatch(path, id, year)) {
      templates.push(new PublisherExactMatch(id, year))
    }
    return templates
  }
}

const requestForJournal = (path) => path === '/journal'
const requestForPublisher = (path) => path === '/publisher'

const issnRegex = /^[0-9]{4}-[0-9]{4}$/
const isIssnSearch = (path, query, year) => isJournalSearch(path, query, year) && issnRegex.test(query)

const queryParametersAreDefined = (query, year) => query !== undefined && year !== undefined
const isJournalSearch = (path, query, year) => queryParametersAreDefined(query, year) && requestForJournal(path)
const isPublisherTitleSearch = (path, query, year) => queryParametersAreDefined(query, year) && requestForPublisher(path)

const pathParametersAreDefined = (id, year) => id !== undefined && year !== undefined
const isJournalExactMatch = (path, id, year) => pathParametersAreDefined(id, year) && requestForJournal(path)
const isPublisherExactMatch = (path, id, year) => pathParametersAreDefined(id, year) && requestForPublisher(path)

module.exports = Request
