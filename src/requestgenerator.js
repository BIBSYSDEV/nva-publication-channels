const fs = require('fs')

class Requestgenerator {
  constructor (event) {
    this.request = this.createRequest(event)
  }

  getRequest () {
    return this.request
  }

  createRequest (event) {
    const params = event.queryStringParameters
    let template
    if (event.path === '/journal') {
      template = queryJournalTemplate
    } else {
      template = queryPublisherTemplate
    }
    let filterValue = '%'
    if (params !== undefined && params.query !== undefined) {
      filterValue = '%' + params.query + '%'
    }
    template.filter[0].selection.values[0] = filterValue
    return template
  }
}

const queryJournalTemplate = JSON.parse(fs.readFileSync('journalQueryTemplate.json').toString())

const queryPublisherTemplate = JSON.parse(fs.readFileSync('queryPublisherTemplate.json').toString())

module.exports = { Requestgenerator }
