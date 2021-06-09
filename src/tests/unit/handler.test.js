'use strict'
const chaiJson = require('chai-json-equal')
const handler = require('../../handler')
const chai = require('chai')
chai.use(chaiJson)
const expect = chai.expect
const httpStatus = require('http-status-codes')
const fs = require('fs')
const httpServerMock = require('nock')
const journalRemoteResponseData = fs.readFileSync('tests/unit/journal_response.json').toString()
const publisherRemoteResponseData = fs.readFileSync('tests/unit/publisher_response.json').toString()

const journalContent = fs.readFileSync('tests/unit/api_journal_response.json').toString()
const publisherContent = fs.readFileSync('tests/unit/api_publisher_response.json').toString()

const NsdServerAddress = 'https://api.nsd.no'
const NsdQueryPath = '/dbhapitjener/Tabeller/hentJSONTabellData'

httpServerMock(NsdServerAddress, { reqheaders: { 'content-type': 'application/json;charset=utf-8' } })
  .persist()
  .post(NsdQueryPath, body => { return JSON.stringify(body).includes('__IDENTIFIER__') })
  .reply(httpStatus.NO_CONTENT, '')

httpServerMock(NsdServerAddress, { reqheaders: { 'content-type': 'application/json;charset=utf-8' } })
  .persist()
  .post(NsdQueryPath, body => { return JSON.stringify(body).includes('not-to-be-found') })
  .reply(httpStatus.NO_CONTENT, '')

httpServerMock(NsdServerAddress, { reqheaders: { 'content-type': 'application/json;charset=utf-8' } })
  .persist().post(NsdQueryPath, body => { return body.tabell_id === 851 })
  .reply(httpStatus.OK, journalRemoteResponseData)

httpServerMock(NsdServerAddress, { reqheaders: { 'content-type': 'application/json;charset=utf-8' } })
  .persist()
  .post(NsdQueryPath, body => { return body.tabell_id === 850 })
  .reply(httpStatus.OK, publisherRemoteResponseData)

describe('Handler throws error when called without path', () => {
  it('verifies response is error 500 and  has Internal Server Error message', async function () {
    const event = { failing: 'call' }
    const response = await handler.handler(event)
    expect(response.statusCode).to.equal(500)
    const responseBody = JSON.parse(response.body)
    expect(responseBody.instance).to.equal('Undefined path')
    expect(responseBody.status).to.equal(500)
    expect(responseBody.detail).to.equal('Your request cannot be processed at this time due to an internal server error')
    expect(responseBody.title).to.equal('Internal Server Error')
    expect(responseBody.type).to.equal('about:blank')
  })
})

describe('Handler returns 404 when illegal route is called', () => {
  const calledPath = '/non-existent'
  it(`return 404 when ${calledPath} is called`, async function () {
    const response = await handler.handler({ path: calledPath, httpMethod: 'GET' })
    expect(response.statusCode).to.equal(404)
    const responseBody = JSON.parse(response.body)
    expect(responseBody.instance).to.equal(calledPath)
    expect(responseBody.status).to.equal(404)
    expect(responseBody.detail).to.equal(`The requested resource ${calledPath} could not be found`)
    expect(responseBody.title).to.equal('Not Found')
    expect(responseBody.type).to.equal('about:blank')
  })
})

describe("Handler verifies route /journal; path '/journal', httpMethod.GET", () => {
  ['/journal', '/publisher'].map(calledPath => (
    it(`GET ${calledPath} returns 200 OK and has empty body`, async function () {
      const httpMethod = 'GET'
      const queryStringParameters = { query: 'query', year: 2020 }
      const event = { path: calledPath, httpMethod: httpMethod, queryStringParameters: queryStringParameters }
      const response = await handler.handler(event)
      expect(response.statusCode).to.equal(httpStatus.OK)
    })
  ))
})

describe('Handler throws 405 when httpMethod is not GET', () => {
  ['HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH'].map(calledMethod => (
    it(`httpMethod ${calledMethod} returns 405`, async function () {
      const httpMethod = calledMethod
      const event = { path: '/journal', httpMethod: httpMethod }
      const response = await handler.handler(event)
      const responseBody = JSON.parse(response.body)
      expect(responseBody.instance).to.equal('/journal')
      expect(responseBody.status).to.equal(405)
      expect(responseBody.detail).to.equal(`The requested http method  ${calledMethod} is not supported`)
      expect(responseBody.title).to.equal('Method Not Allowed')
      expect(responseBody.type).to.equal('about:blank')
    })
  ))
})

describe('Handler throws error when called with queryStringParameters', () => {
  it('verifies response is error 400 and has Bad Request problem response', async function () {
    const queryStringParameters = 'sample.query.string.parameter'
    const event = { path: '/journal', httpMethod: 'GET', queryStringParameters: queryStringParameters }
    const response = await handler.handler(event)
    expect(response.statusCode).to.equal(400)
    const responseBody = JSON.parse(response.body)
    expect(responseBody.instance).to.equal(`/journal?${queryStringParameters}`)
    expect(responseBody.status).to.equal(400)
    expect(responseBody.detail).to.equal(`Your request cannot be processed because the supplied parameter(s) ${queryStringParameters} cannot be understood`)
    expect(responseBody.title).to.equal('Bad Request')
    expect(responseBody.type).to.equal('about:blank')
  })
})

describe("Handler sets different 'Content-type' in respnse headers", () => {
  const queryStringParameters = { query: 'query', year: 2020 }
  it("returns 'Content-Type' 'application/json' when responsecode is 200", async function () {
    const event = { path: '/journal', httpMethod: 'GET', queryStringParameters: queryStringParameters }
    const response = await handler.handler(event)
    expect(response.statusCode).to.equal(httpStatus.OK)
    expect(response.headers).to.have.property('Content-Type')
    expect(response.headers['Content-Type']).to.equal('application/json')
  })
  it("returns 'Content-Type' 'application/problem+json' when error occurs", async function () {
    const event = { path: '/jornal', httpMethod: 'GET', queryStringParameters: queryStringParameters }
    const response = await handler.handler(event)
    expect(response.statusCode).to.equal(httpStatus.NOT_FOUND)
    expect(response.headers).to.have.property('Content-Type')
    expect(response.headers['Content-Type']).to.equal('application/problem+json')
  })
})

describe('Handler verifies queryStringParameters and returns 200 with empty body when called with specified queryStringParameters', () => {
  it('Returns 200 OK and a empty body when only "query" parameter is set', async function () {
    const queryStringParameters = { query: 'query', year: 2020 }
    const event = { path: '/journal', httpMethod: 'GET', queryStringParameters: queryStringParameters }
    const response = await handler.handler(event)
    expect(response.statusCode).to.equal(httpStatus.OK)
    const expected = JSON.parse(response.body)
    const actual = JSON.parse(journalContent)
    expect(expected).to.jsonEqual(actual)
  })
  it('returns 200 OK and a empty body when all parameters set', async function () {
    const queryStringParameters = { query: 'query', year: 2020, start: 1 }
    const event = { path: '/publisher', httpMethod: 'GET', queryStringParameters: queryStringParameters }
    const response = await handler.handler(event)
    expect(response.statusCode).to.equal(httpStatus.OK)
    const expected = JSON.parse(response.body)
    const actual = JSON.parse(publisherContent)
    expect(expected).to.jsonEqual(actual)
  })
})

describe('Handler returns bad request when error in query ', () => {
  it('returns 400 Bad Request when obligatory "query"-parameter is missing', async function () {
    const queryStringParameters = { year: 2020, start: 1 }
    const event = { path: '/journal', httpMethod: 'GET', queryStringParameters: queryStringParameters }
    const response = await handler.handler(event)
    expect(response.statusCode).to.equal(httpStatus.BAD_REQUEST)
  })
  it('returns 400 Bad Request when extra unknown parameter is added', async function () {
    const queryStringParameters = { query: 'query', year: 2020, start: 1, nonSupportedParmeter: 'error' }
    const event = { path: '/journal', httpMethod: 'GET', queryStringParameters: queryStringParameters }
    const response = await handler.handler(event)
    expect(response.statusCode).to.equal(httpStatus.BAD_REQUEST)
  })
  it('returns 400 Bad Request when value of query parameter is empty string', async function () {
    const queryStringParameters = { query: '' }
    const event = { path: '/journal', httpMethod: 'GET', queryStringParameters: queryStringParameters }
    const response = await handler.handler(event)
    expect(response.statusCode).to.equal(httpStatus.BAD_REQUEST)
  })
  it('returns 400 Bad Request when value of query parameter is null', async function () {
    const queryStringParameters = { query: null }
    const event = { path: '/journal', httpMethod: 'GET', queryStringParameters: queryStringParameters }
    const response = await handler.handler(event)
    expect(response.statusCode).to.equal(httpStatus.BAD_REQUEST)
  })
})

describe('Handler returns response 200 OK when called', () => {
  ['/journal', '/publisher'].map(calledPath => (
    it(`returns 200 OK for ${calledPath}`, async function () {
      const queryStringParameters = { query: 'Alzheimers', year: 2020, start: 1 }
      const event = { path: calledPath, httpMethod: 'GET', queryStringParameters: queryStringParameters }
      const response = await handler.handler(event)
      expect((await response).statusCode).to.equal(httpStatus.OK)
    })
  ))
})

describe('Handler returns response 200 OK when called with correct query which gives 0 hits', () => {
  ['/journal', '/publisher'].map(calledPath => (
    it(`returns 200 OK for ${calledPath}`, async function () {
      const queryStringParameters = { query: 'not-to-be-found', year: 2020, start: 1 }
      const event = { path: calledPath, httpMethod: 'GET', queryStringParameters: queryStringParameters }
      const response = await handler.handler(event)
      expect((await response).statusCode).to.equal(httpStatus.OK)
    })
  ))
})

describe('Handler returns response 404 Not Found when called with path parameters with 0 hits', () => {
  ['/journal/12345/1000', '/publisher/54321/1000'].map(calledPath => (
    it(`returns 404 Not found for ${calledPath}`, async function () {
      const event = { path: calledPath, httpMethod: 'GET', pathParameters: { pid: '123231' } }
      const response = await handler.handler(event)
      expect((await response).statusCode).to.equal(httpStatus.NOT_FOUND)
    })
  ))
})
