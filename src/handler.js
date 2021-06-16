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
  try {
    const request = new Event(event)
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
  } catch (clientError) {
    return new ErrorResponse(createErrorDetails(clientError), clientError)
  }
}

const isSingleJournalRequest = (request) => {
  return isGetMethod(request.httpMethod) &&
    request.path.startsWith('/journal/') &&
    request.pathParameters instanceof PathParameters &&
    request.pathParameters.isValid &&
    request.queryParameters instanceof NullQueryParameters
}

const isSinglePublisherRequest = (request) => {
  return isGetMethod(request.httpMethod) &&
    request.path.startsWith('/publisher/') &&
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
  return {
    code: httpStatus.NOT_FOUND,
    message: `The requested resource ${event.fullPath} could not be found`
  }
}

const createMethodNotAllowedDetails = (event) => {
  return {
    code: httpStatus.METHOD_NOT_ALLOWED,
    message: `The requested http method  ${event.httpMethod} is not supported`
  }
}

const createBadRequestDetails = (event) => {
  return {
    code: httpStatus.BAD_REQUEST,
    message: `Your request cannot be processed because the supplied parameter(s) ${event.queryParameters.queryParameterString} cannot be understood`
  }
}

const createErrorDetails = (response) => isGetMethod(response.httpMethod) ? problemsWithGetMethod(response) : createMethodNotAllowedDetails(response)

function isQueryRequest (event) {
  return routes.includes(event.path) && !(event.queryParameters instanceof NullQueryParameters)
}

function missingParameters (event) {
  return (event.queryParameters instanceof NullQueryParameters && event.pathParameters instanceof NullPathParameters)
}

const problemsWithGetMethod = (event) => {
  if (event.path === undefined) {
    return createNotFoundDetails(event)
  } else if ((event.path === undefined) || (isQueryRequest(event) || missingParameters(event))) {
    return createBadRequestDetails(event)
  } else if (!(event.pathParameters instanceof NullPathParameters) && !(event.pathParameters.isValid)) {
    return createBadRequestDetails(event)
  } else if (!(routes.includes(event.path))) {
    return createNotFoundDetails(event)
  }
}

module.exports = { handler }
