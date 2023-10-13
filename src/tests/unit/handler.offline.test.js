'use strict'
const chaiJson = require('chai-json-equal')
const handler = require('../../handler')
const chai = require('chai')
chai.use(chaiJson)
chai.use(require('chai-string'))
const expect = chai.expect
const httpStatus = require('http-status-codes')
const httpServerMock = require('nock')
const DbhServerAddress = 'https://kanalregister.hkdir.no/'
const DbhQueryPath = '/api/krtabeller/hentJSONTabellData'

const APPLICATION_JSON = 'application/json'
const HOST_DOMAIN = 'api.nva.dev.aws.unit.no'
const HOST_BASEPATH = 'publication-channels'

const dbhMockReturns = (statusCode, returnValue) => {
  httpServerMock.cleanAll()
  httpServerMock(DbhServerAddress,
    { reqheaders: { 'content-type': 'application/json' } })
    .post(DbhQueryPath, () => {
      return true
    })
    .reply(statusCode, returnValue)
}

const createTestEvent = (acceptType, httpMethod, resource, pathParameters, queryParameters, domainName = HOST_DOMAIN) => {
  return {
    requestContext: { domainName: domainName },
    headers: { Accept: acceptType },
    httpMethod: httpMethod,
    path: resource,
    pathParameters: pathParameters,
    queryStringParameters: queryParameters
  }
}

describe('Handler expected behavior', () => {
  beforeEach(() => {
    process.env.DOMAIN = HOST_DOMAIN
    process.env.BASEPATH = HOST_BASEPATH
    process.env.FROM_CACHE = 'true'
  })
  afterEach(() => {
    process.env.FROM_CACHE = 'false'
  })
  describe('No call is made to DBH API when fromCache flag is set', () => {
    const year = '2004'
    it('should return data from cache for single journal', async () => {
      const identifier = '339720'
      const path = `/journal/${identifier}/${year}`
      const pathParameters = { id: `${identifier}`, year: `${year}` }
      dbhMockReturns(httpStatus.BAD_GATEWAY, null)
      const event = createTestEvent(APPLICATION_JSON, 'GET', path, pathParameters, null)
      const response = await handler.handler(event)
      expect((await response).statusCode).to.equal(httpStatus.OK)
      const body = JSON.parse(response.body)
      expect(body.id).to.equal(`https://api.nva.dev.aws.unit.no/publication-channels/journal/${identifier}/${year}`)
      expect(body.type).to.equal('Journal')
    })
    it('should return data from cache for single publisher', async () => {
      const identifier = '6435'
      const path = `/publisher/${identifier}/${year}`
      const pathParameters = { id: `${identifier}`, year: `${year}` }
      dbhMockReturns(httpStatus.BAD_GATEWAY, null)
      const event = createTestEvent(APPLICATION_JSON, 'GET', path, pathParameters, null)
      const response = await handler.handler(event)
      expect((await response).statusCode).to.equal(httpStatus.OK)
      const body = JSON.parse(response.body)
      expect(body.id).to.equal(`https://api.nva.dev.aws.unit.no/publication-channels/publisher/${identifier}/${year}`)
      expect(body.type).to.equal('Publisher')
    })
    it('should return data from cache for print issn-search', async () => {
      const issn = '0304-4203'
      dbhMockReturns(httpStatus.BAD_GATEWAY, null)
      const queryStringParameters = {
        query: issn,
        year: '2020'
      }
      const event = createTestEvent(APPLICATION_JSON, 'GET', '/journal', null, queryStringParameters)

      const response = await handler.handler(event)
      expect((await response).statusCode).to.equal(httpStatus.OK)
      expect(response.body).to.contain(issn)
    })
    it('should return data from cache for online issn-search', async () => {
      const issn = '1872-7581'
      dbhMockReturns(httpStatus.BAD_GATEWAY, null)
      const queryStringParameters = {
        query: issn,
        year: '2020'
      }
      const event = createTestEvent(APPLICATION_JSON, 'GET', '/journal', null, queryStringParameters)

      const response = await handler.handler(event)
      expect((await response).statusCode).to.equal(httpStatus.OK)
      expect(response.body).to.contain(issn)
    })
    it('should return data from cache for online publisher-search', async () => {
      const name = 'Riksarkivet'
      dbhMockReturns(httpStatus.BAD_GATEWAY, null)
      const queryStringParameters = {
        query: name,
        year: '2020'
      }
      const event = createTestEvent(APPLICATION_JSON, 'GET', '/publisher', null, queryStringParameters)

      const response = await handler.handler(event)
      expect((await response).statusCode).to.equal(httpStatus.OK)
      expect(response.body).to.contain(name)
    })
    it('should return empty from cache for journal search that does not exist', async () => {
      const name = 'Riksarkivet for anchors'
      dbhMockReturns(httpStatus.BAD_GATEWAY, null)
      const queryStringParameters = {
        query: name,
        year: '2020'
      }
      const event = createTestEvent(APPLICATION_JSON, 'GET', '/journal', null, queryStringParameters)

      const response = await handler.handler(event)
      expect((await response).statusCode).to.equal(httpStatus.OK)
      expect(response.body).to.equal('[]')
    })
    it('should return empty from cache for publisher search that does not exist', async () => {
      const name = 'Riksarkivet for anchors'
      dbhMockReturns(httpStatus.BAD_GATEWAY, null)
      const queryStringParameters = {
        query: name,
        year: '2020'
      }
      const event = createTestEvent(APPLICATION_JSON, 'GET', '/publisher', null, queryStringParameters)

      const response = await handler.handler(event)
      expect((await response).statusCode).to.equal(httpStatus.OK)
      expect(response.body).to.equal('[]')
    })
  })
})
