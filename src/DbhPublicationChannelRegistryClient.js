const uri = 'https://kanalregister.hkdir.no/api/krtabeller/hentJSONTabellData'
const ErrorResponse = require('./response/ErrorResponse')
const httpStatus = require('http-status-codes')

const axios = require('axios')
const { extractFromCsv } = require('./CsvClient')
const { responseWithBody } = require('./ResponseWithBody')
const Request = require('./Request')

const handleRemoteResponse = (dbhResponse, request, type, accept) => {
  if (dbhResponse.status === httpStatus.NO_CONTENT && request.hasPathParameters) {
    return new ErrorResponse({ code: httpStatus.NOT_FOUND, message: 'Not Found' }, { path: request.path, fullPath: request.path })
  }
  return responseWithBody(dbhResponse.data, type, request.year, accept)
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

const executeRequest = (currentRequest, originalRequest) => {
  return process.env.FROM_CACHE === undefined || process.env.FROM_CACHE === 'false'
    ? executeRemoteRequest(currentRequest, originalRequest.request, originalRequest.type, originalRequest.accept)
    : extractFromCsv(currentRequest, originalRequest)
}

const executeRemoteRequest = async (currentRequest, request, type, accept) => await axios.post(uri, currentRequest)
  .then((dbhResponse) => {
    return handleRemoteResponse(dbhResponse, request, type, accept)
  })
  .catch((error) => {
    return handleError(error, request.path)
  })

const performQuery = async (event, accept) => {
  const request = new Request(event)
  const originalRequest = {
    request: request,
    path: request.path,
    type: extractQueryType(request.path),
    queryParameters: event.queryParameters,
    accept: accept
  }
  // TODO: Fix ISSN case where we have two requests
  let response = null
  for (const item of request.requests) {
    if (response !== null && response.body !== '[]') { break }
    response = await executeRequest(item, originalRequest)
  }
  return response
}

module.exports = {
  performQuery
}
