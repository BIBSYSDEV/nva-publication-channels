const channelRegistryUri = 'https://api.nsd.no/dbhapitjener/Tabeller/hentJSONTabellData'

const axios = require('axios')
const RemoteJournalResponse = require('./response/RemoteJournalResponse')
const RemotePublisherResponse = require('./response/RemotePublisherResponse')

const responseWithBody = (body, type, year) => {
  const response = []
  const level = `Nivå ${year}`
  if (type === 'journal') {
    body.forEach(item => response.push(new RemoteJournalResponse(item['Tidsskrift id'], year, item['Original tittel'], item.Url, item[level], item.Aktiv, item['Online ISSN'], item['Print ISSN'], item['NPI Fagfelt'], item['Open Access'], item['Språk'], item.Utgiver)))
  } else {
    body.forEach(item => response.push(new RemotePublisherResponse(item['Forlag id'], year, item['Original tittel'], item.Url, item[level], item.Aktiv)))
  }
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
  return responseWithBody(nsdResponse.data, type, year)
}

module.exports = {
  performQuery,
  responseWithBody
}
