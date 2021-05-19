'use strict'

const { handler } = require('../../handler')
const chai = require('chai')
const expect = chai.expect

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

describe('Handler returns 404 when any route is called', () => {
  const calledPath = '/non-existent'
  it(`Handler returns 404 when ${calledPath} is called`, async function () {
    const response = await handler({ path: calledPath })
    expect(response.statusCode).to.equal(404)
    const responseBody = JSON.parse(response.body)
    expect(responseBody.instance).to.equal(calledPath)
    expect(responseBody.status).to.equal(404)
    expect(responseBody.detail).to.equal(`The requested resource ${calledPath} could not be found`)
    expect(responseBody.title).to.equal('Not Found')
    expect(responseBody.type).to.equal('about:blank')
  })
})

describe('Handler returns Access-Control-headers when method is OPTIONS', () => {
  const calledPath = '/'
  const httpMethod = 'OPTIONS'
  it(`Handler returns 200 when ${calledPath} is called`, async function () {
    const response = await handler({ path: calledPath, httpMethod: httpMethod })
    expect(response.statusCode).to.equal(200)
    expect(response.headers).to.include.key('Access-Control-Allow-Origin')
    expect(response.headers).to.include.key('Access-Control-Allow-Methods')
    expect(response.headers).to.include.key('Access-Control-Allow-Headers')
  })
})
