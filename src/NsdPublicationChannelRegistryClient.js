const channelRegistryUri = 'https://api.nsd.no/dbhapitjener/Tabeller/hentJSONTabellData'
const ErrorResponse = require('./response/ErrorResponse')
const httpStatus = require('http-status-codes')

const axios = require('axios')
const RemoteJournalResponse = require('./response/RemoteJournalResponse')
const RemotePublisherResponse = require('./response/RemotePublisherResponse')
const URI = require('urijs')

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

const handleRemoteResponse = (nsdResponse, request, type, accept) => {
  if (nsdResponse.status === httpStatus.NO_CONTENT && request.hasPathParameters) {
    return new ErrorResponse({ code: httpStatus.NOT_FOUND, message: 'Not Found' }, { path: request.path, fullPath: request.path })
  }
  return responseWithBody(nsdResponse.data, type, request.year, accept)
}

const handleError = (error, request) => {
  return error.response.status === httpStatus.BAD_GATEWAY
    ? new ErrorResponse({ code: httpStatus.BAD_GATEWAY, message: 'Your request cannot be processed at this time due to an upstream error' }, { path: request.path })
    : error.response.status === httpStatus.GATEWAY_TIMEOUT
      ? new ErrorResponse({ code: httpStatus.GATEWAY_TIMEOUT, message: 'Your request cannot be processed at this time because the upstream server response took too long' }, { path: request.path })
      : new ErrorResponse({ code: error.response.status, message: error.response.statusText }, { path: request.path })
}

const extractQueryType = (path) => {
  const secondIndexOfSlash = path.indexOf('/', 1) > 0 ? path.indexOf('/', 1) : path.length
  return path.slice(1, secondIndexOfSlash)
}

const performQuery = async (request, accept) => {
  const path = request.path
  const type = extractQueryType(path)
  // TODO: Fix ISSN case where we have two requests
  const currentRequest = request.requests[0]
  return await axios.post(channelRegistryUri, currentRequest)
    .then((nsdResponse) => {
      return handleRemoteResponse(nsdResponse, request, type, accept)
    })
    .catch((error) => {
      return handleError(error, request)
    })
}

module.exports = {
  performQuery,
  responseWithBody
}
