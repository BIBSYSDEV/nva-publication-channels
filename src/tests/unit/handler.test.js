'use strict'

const { handler } = require('../../handler')
const chai = require('chai')
const expect = chai.expect
const httpStatus = require('http-status-codes')

describe('Handler throws error when called', () => {
  it('verifies response is error 500 and  has Internal Server Error message', async function () {
    const event = { failing: 'call' }
    const response = await handler(event)
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
  it(`Handler returns 404 when ${calledPath} is called`, async function () {
    const response = await handler({ path: calledPath, httpMethod: 'GET' })
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
      const emptyBody = '{}'
      const event = { path: calledPath, httpMethod: httpMethod }
      const response = await handler(event)
      expect(response.statusCode).to.equal(httpStatus.OK)
      expect(response.body).to.equal(emptyBody)
    })
  ))
})

describe('Handler throws 405 when httpMethod is not GET', () => {
  ['HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH'].map(calledMethod => (
    it(`httpmMethod ${calledMethod} returns 405`, async function () {
      const httpMethod = calledMethod
      const event = { path: '/journal', httpMethod: httpMethod }
      const response = await handler(event)
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
    const response = await handler(event)
    expect(response.headers).to.have.property('Content-Type')
    expect(response.headers['Content-Type']).to.equal('application/problem+json')
    expect(response.statusCode).to.equal(400)
    const responseBody = JSON.parse(response.body)
    expect(responseBody.instance).to.equal(`/journal?${queryStringParameters}`)
    expect(responseBody.status).to.equal(400)
    expect(responseBody.detail).to.equal(`Your request cannot be processed because the supplied parameter(s) ${queryStringParameters} cannot be understood`)
    expect(responseBody.title).to.equal('Bad Request')
    expect(responseBody.type).to.equal('about:blank')
  })
})
