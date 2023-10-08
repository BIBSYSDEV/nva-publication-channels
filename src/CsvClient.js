const NullQueryParameters = require('./event/NullQueryParameters')
const fs = require('fs')
const { parse } = require('csv-parse')
const { finished } = require('stream/promises')
const { responseWithBody } = require('./ResponseWithBody')

const extractIdentifier = request => {
  return request.path.split('/')[2]
}

const extractYear = request => {
  return request.path.split('/')[3]
}

const extractQueryParams = queryParams => {
  return { query: queryParams.query, year: queryParams.year }
}

const extractFromCsv = (request, originalRequest) => {
  const file = originalRequest.type === 'journal' ? './datafiles/journals.csv' : './datafiles/publishers.csv'
  if (originalRequest.queryParameters === undefined || originalRequest.queryParameters instanceof NullQueryParameters) {
    const item = scanCsvById(extractIdentifier(originalRequest), extractYear(originalRequest), originalRequest.type, originalRequest.accept, file)
    return Promise.resolve(item)
  } else {
    const item = scanCsvByIssn(extractQueryParams(originalRequest.queryParameters), originalRequest.type, originalRequest.accept, file)
    return Promise.resolve(item)
  }
}

const searchInColumn = (source, record, queryParams, result) => {
  if (source.length === 1) {
    if (record[source] === queryParams.query) {
      result.push(record)
    }
  } else {
    if (record[source[0]] === queryParams.query || record[source[1]] === queryParams.query) {
      result.push(record)
    }
  }
}

const scanCsvByIssn = async (queryParams, type, accept, file) => {
  const source = getSearchSourceField(type)
  const result = []
  const parser = fs.createReadStream(file, { autoClose: true })
    .pipe(parse({ delimiter: ',', columns: true, relax_quotes: true }))
  parser.on('readable', () => {
    let record

    while ((record = parser.read()) !== null) {
      searchInColumn(source, record, queryParams, result)
    }
  })
  await finished(parser)

  return responseWithBody(result, type, queryParams.year, accept)
}

const getSearchSourceField = type => type === 'journal' ? ['Print ISSN', 'Online ISSN'] : ['Original tittel']

const getIdSourceField = type => type === 'journal' ? ['Tidsskrift id'] : ['Forlag id']

const scanCsvById = async (identifier, year, type, accept, file) => {
  const source = getIdSourceField(type)
  const result = []
  const parser = fs.createReadStream(file, { autoClose: true })
    .pipe(parse({ delimiter: ',', columns: true, relax_quotes: true }))
  parser.on('readable', () => {
    let record
    while ((record = parser.read()) !== null) {
      if (record[source[0]] === identifier) {
        result.push(record)
      }
    }
  })
  parser.on('error', err => {
    console.error(err.message)
  })

  parser.on('end', () => {
    console.log(result)
  })
  await finished(parser)

  return responseWithBody(result, type, year, accept)
}

module.exports = {
  extractFromCsv
}
