'use strict'

const { handler } = require('../../handler')
const chai = require('chai')
const expect = chai.expect
const httpStatus = require('http-status-codes')

describe('Handler throws error when called with illegal path', () => {
  it('verifies response is error 404-NOT FOUND, and has Not Found error message', async function () {
    const calledPath = '/some.path'
    const event = { path: calledPath }
    const response = await handler(event)
    expect(response.statusCode).to.equal(httpStatus.NOT_FOUND)
    const responseBody = JSON.parse(response.body)
    expect(responseBody.instance).to.equal(calledPath)
    expect(responseBody.status).to.equal(httpStatus.NOT_FOUND)
    expect(responseBody.detail).to.equal("Your request cannot be processed at this time due of 'Not Found'")
    expect(responseBody.title).to.equal(httpStatus.getReasonPhrase(httpStatus.NOT_FOUND))
    expect(responseBody.type).to.equal('about:blank')
  })
})

describe('Handler throws error when called with illegal method and correct path', () => {
  ['/journal', '/publisher'].map(calledPath => (
    it(`Put on path ${calledPath} returns 405-Method Not Allowed, and has Method Not Allowed error message`, async function () {
      const httpMethod = 'PUT'
      const event = { path: calledPath, httpMethod: httpMethod }
      const response = await handler(event)
      expect(response.statusCode).to.equal(httpStatus.METHOD_NOT_ALLOWED)
      const responseBody = JSON.parse(response.body)
      expect(responseBody.instance).to.equal(calledPath)
      expect(responseBody.status).to.equal(httpStatus.METHOD_NOT_ALLOWED)
      expect(responseBody.detail).to.equal("Your request cannot be processed at this time due of 'Method Not Allowed'")
      expect(responseBody.title).to.equal('Method Not Allowed')
      expect(responseBody.type).to.equal('about:blank')
    })
  ))
})

describe("Handler verifies route /journal; path '/journal', httpMethod.GET and pathParameter 'pid'", () => {
  ['/journal', '/publisher'].map(calledPath => (
    it(`GET ${calledPath} returns 200 OK and has empty body`, async function () {
      const journalPid = 'just.a.pid'
      const httpMethod = 'GET'
      const emptyBody = '{}'
      const event = { path: calledPath, pathParameters: journalPid, httpMethod: httpMethod }
      const response = await handler(event)
      expect(response.statusCode).to.equal(200)
      expect(response.body).to.equal(emptyBody)
    })
  ))
})
