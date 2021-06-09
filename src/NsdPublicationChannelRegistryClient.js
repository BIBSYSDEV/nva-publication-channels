const channelRegistryUri = 'https://api.nsd.no/dbhapitjener/Tabeller/hentJSONTabellData'
const ErrorResponse = require('./response/ErrorResponse')

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
  const response = extractHits(year, type, body)
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    isBase64Encoded: false,
    body: JSON.stringify(response)
  }
}

const performQuery = async (request, path, year) => {
  const type = path.substr(1, path.length)
  const nsdResponse = await axios.post(channelRegistryUri, request)
  if (nsdResponse.status === 204) {
    return new ErrorResponse({ code: 404, message: 'Not Found' }, { path: path })
  }
  return responseWithBody(nsdResponse.data, type, year)
}

module.exports = {
  performQuery,
  responseWithBody
}
