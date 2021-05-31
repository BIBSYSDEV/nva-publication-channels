const fs = require('fs')

class Request {
  constructor (event) {
    this.request = this.createRequest(event)
  }

  getRequest () {
    return this.request
  }

  createRequest (event) {
    const params = event.queryStringParameters
    const template = event.path === '/journal' ? readTemplate('query_journal_template.json') : readTemplate('query_publisher_template.json')
    let filterValue = '%'
    if (params !== undefined && params.query !== undefined) {
      filterValue = '%' + params.query + '%'
    }
    template.filter[0].selection.values[0] = filterValue
    return template
  }
}
const readTemplate = (path) => JSON.parse(fs.readFileSync(path).toString())

module.exports = { Request }
