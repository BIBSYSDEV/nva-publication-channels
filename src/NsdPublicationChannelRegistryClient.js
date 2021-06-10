const channelRegistryUri = 'https://api.nsd.no/dbhapitjener/Tabeller/hentJSONTabellData'
const ErrorResponse = require('./response/ErrorResponse')
const httpStatus = require('http-status-codes')

const axios = require('axios')
const RemoteJournalResponse = require('./response/RemoteJournalResponse')
const RemotePublisherResponse = require('./response/RemotePublisherResponse')

const isJournal = (type) => type === 'journal'

const extractHits = (year, type, body) => {
  const response = []
  const level = `Nivå ${year}`
  isJournal(type)
    ? body.forEach(item => response.push(new RemoteJournalResponse(item['Tidsskrift id'], year, item['Original tittel'], item.Url, item[level], item.Aktiv, item['Online ISSN'], item['Print ISSN'], item['NPI Fagfelt'], item['Open Access'], item['Språk'], item.Utgiver)))
    : body.forEach(item => response.push(new RemotePublisherResponse(item['Forlag id'], year, item['Original tittel'], item.Url, item[level], item.Aktiv)))
  return response
}

const responseWithBody = (body, type, year) => {
  const response = (body.length > 0) ? extractHits(year, type, body) : '[]'
  return {
    statusCode: httpStatus.OK,
    headers: {
      'Content-Type': 'application/json'
    },
    isBase64Encoded: false,
    body: JSON.stringify(response)
  }
}

const performQuery = async (request) => {
  const type = request.path.substr(1, request.path.length)
  const nsdResponse = await axios.post(channelRegistryUri, request.nsdRequest)
  if (nsdResponse.status === httpStatus.NO_CONTENT && request.hasPathParameters) {
    return new ErrorResponse({ code: httpStatus.NOT_FOUND, message: 'Not Found' }, { path: request.path })
  }
  return responseWithBody(nsdResponse.data, type, request.queryStringParameters.year)
}

module.exports = {
  performQuery,
  responseWithBody
}
