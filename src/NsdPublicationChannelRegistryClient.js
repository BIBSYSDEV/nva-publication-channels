const channelRegistryUri = 'https://api.nsd.no/dbhapitjener/Tabeller/hentJSONTabellData'
const ErrorResponse = require('./response/ErrorResponse')
const httpStatus = require('http-status-codes')

const axios = require('axios')
const RemoteJournalResponse = require('./response/RemoteJournalResponse')
const RemotePublisherResponse = require('./response/RemotePublisherResponse')

const isJournal = (type) => type === 'journal'

const extractHits = (host, year, type, body) => {
  const response = []
  const level = `Nivå ${year}`
  isJournal(type)
    ? body.forEach(item => response.push(new RemoteJournalResponse(host, item['Tidsskrift id'], year, item['Original tittel'], item.Url, item[level], item.Aktiv, item['Online ISSN'], item['Print ISSN'], item['NPI Fagfelt'], item['Open Access'], item['Språk'], item['Forlag id'], item.Utgiver)))
    : body.forEach(item => response.push(new RemotePublisherResponse(host, item['Forlag id'], year, item['Original tittel'], item.Url, item[level], item.Aktiv)))
  return response
}

const responseWithBody = (host, body, type, year, accept) => {
  const response = (body.length > 0) ? extractHits(host, year, type, body) : '[]'
  return {
    statusCode: httpStatus.OK,
    headers: {
      'Content-Type': accept
    },
    isBase64Encoded: false,
    body: JSON.stringify(response)
  }
}

const handleRemoteResponse = (nsdResponse, request, type, accept) => {
  if (nsdResponse.status === httpStatus.NO_CONTENT && request.hasPathParameters) {
    return new ErrorResponse({ code: httpStatus.NOT_FOUND, message: 'Not Found' }, { path: request.path, fullPath: request.path })
  }
  return responseWithBody(request.domain, nsdResponse.data, type, request.year, accept)
}

const handleError = (error, request) => {
  return error.response.status === httpStatus.BAD_GATEWAY
    ? new ErrorResponse({ code: httpStatus.BAD_GATEWAY, message: 'Your request cannot be processed at this time due to an upstream error' }, { path: request.path })
    : error.response.status === httpStatus.GATEWAY_TIMEOUT
      ? new ErrorResponse({ code: httpStatus.GATEWAY_TIMEOUT, message: 'Your request cannot be processed at this time because the upstream server response took too long' }, { path: request.path })
      : new ErrorResponse({ code: error.response.status, message: error.response.statusText }, { path: request.path })
}

const performQuery = async (request, accept) => {
  const path = request.path
  const secondIndexOfSlash = path.indexOf('/', 1) > 0 ? path.indexOf('/', 1) : path.length
  const type = path.slice(1, secondIndexOfSlash)
  // TODO: Fix ISSN case where we have two requests
  const currentRequest = request.requests[0]
  return await axios.post(channelRegistryUri, currentRequest)
    .then((nsdResponse) => { return handleRemoteResponse(nsdResponse, request, type, accept) })
    .catch((error) => { return handleError(error, request) })
}

module.exports = {
  performQuery,
  responseWithBody
}
