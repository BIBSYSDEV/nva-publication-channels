const httpStatus = require('http-status-codes')
const URI = require('urijs')
const RemoteJournalResponse = require('./response/RemoteJournalResponse')
const RemotePublisherResponse = require('./response/RemotePublisherResponse')

const hostUri = () => URI(`https://${process.env.DOMAIN}/${process.env.BASEPATH}`).toString()

const isJournal = (type) => type === 'journal'

const extractHits = (year, type, body) => {
  const response = []
  const level = `Nivå ${year}`
  isJournal(type)
    ? body.forEach(item => response.push(
      new RemoteJournalResponse(hostUri(), item['Tidsskrift id'], year, item['Original tittel'], item.Url, item[level], item.Aktiv, item['Online ISSN'], item['Print ISSN'], item['NPI Fagfelt'], item['Open Access'], item['Språk'], item['Forlag id'])))
    : body.forEach(item => response.push(new RemotePublisherResponse(hostUri(), item['Forlag id'], year, item['Original tittel'], item.Url, item[level], item.Aktiv)))
  return response
}

const responseWithBody = (body, type, year, accept) => {
  const response = (body.length > 0) ? extractHits(year, type, body) : []
  return {
    statusCode: httpStatus.OK,
    headers: {
      'Content-Type': accept,
      'Access-Control-Allow-Origin': '*'
    },
    isBase64Encoded: false,
    body: JSON.stringify(response)
  }
}

module.exports = {
  responseWithBody
}
