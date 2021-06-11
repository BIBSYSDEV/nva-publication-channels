const httpStatus = require('http-status-codes')
const logger = require('pino')({ useLevelLabels: true })
const Request = require('./Request')
const nsdClient = require('./NsdPublicationChannelRegistryClient')
const ErrorResponse = require('./response/ErrorResponse')
const Event = require('./event/Event')
const NullQueryParameters = require('./event/NullQueryParameters')
const NullPathParameters = require('./event/NullPathParameters')
const PathParameters = require('./event/PathParameters')

logger.info('Logger initialized')

const routes = ['/journal', '/publisher']

const handler = async (event, context) => {
  const request = new Event(event)
  if (!request.isValid) {
    return new ErrorResponse(createInternalServerErrorDetails(), request)
  }
  if (isSingleJournalRequest(request)) {
    return returnQueryResponse(request)
  } else if (isSinglePublisherRequest(request)) {
    return returnQueryResponse(request)
  } else if (isJournalSearch(request)) {
    return returnQueryResponse(request)
  } else if (isPublisherSearch(request)) {
    return returnQueryResponse(request)
  } else {
    return new ErrorResponse(createErrorDetails(request), request)
  }
}

const isSingleJournalRequest = (request) => {
  return isGetMethod(request.httpMethod) &&
    request.path === '/journal' &&
    request.pathParameters instanceof PathParameters &&
    request.pathParameters.isValid &&
    request.queryParameters instanceof NullQueryParameters
}

const isSinglePublisherRequest = (request) => {
  return isGetMethod(request.httpMethod) &&
      request.path === '/publisher' &&
      request.pathParameters.isValid &&
      request.queryParameters instanceof NullQueryParameters
}

const isJournalSearch = (request) => {
  return isGetMethod(request.httpMethod) &&
    request.path === '/journal' &&
    request.pathParameters instanceof NullPathParameters &&
    request.queryParameters.isValid === true
}

const isPublisherSearch = (request) => {
  return isGetMethod(request.httpMethod) &&
      request.path === '/publisher' &&
      request.pathParameters instanceof NullPathParameters &&
      request.queryParameters.isValid === true
}

const returnQueryResponse = (event) => {
  const requests = new Request(event)
  return nsdClient.performQuery(requests, event.path)
}

const isGetMethod = (httpMethod) => httpMethod === 'GET'

const createNotFoundDetails = (event) => {
  return { code: httpStatus.NOT_FOUND, message: `The requested resource ${event.fullPath} could not be found` }
}

const createMethodNotAllowedDetails = (event) => {
  return { code: httpStatus.METHOD_NOT_ALLOWED, message: `The requested http method  ${event.httpMethod} is not supported` }
}

const createInternalServerErrorDetails = () => {
  return { code: httpStatus.INTERNAL_SERVER_ERROR, message: 'Your request cannot be processed at this time due to an internal server error' }
}

const createBadRequestDetails = (event) => {
  return { code: httpStatus.BAD_REQUEST, message: `Your request cannot be processed because the supplied parameter(s) ${event.queryParameters.queryParameterString} cannot be understood` }
}

const createErrorDetails = (response) => isGetMethod(response.httpMethod) ? problemsWithGetMethod(response) : createMethodNotAllowedDetails(response)

const problemsWithGetMethod = event => !routes.includes(event.path) ? createNotFoundDetails(event) : createBadRequestDetails(event)

module.exports = { handler }
