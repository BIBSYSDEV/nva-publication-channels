'use strict'

const { handler } = require('../../handler')
const chai = require('chai')
const expect = chai.expect

describe('Handler throws error when called', () => {
  it('verifies response is error 500 and  has Internal Server Error message', async function () {
    const calledPath = '/some.path'
    const event = { path: calledPath }
    const response = await handler(event)
    expect(response.statusCode).to.equal(500)
    const responseBody = JSON.parse(response.body)
    expect(responseBody.instance).to.equal(calledPath)
    expect(responseBody.status).to.equal(500)
    expect(responseBody.detail).to.equal('Your request cannot be processed at this time because of an internal server error')
    expect(responseBody.title).to.equal('Internal Server Error')
    expect(responseBody.type).to.equal('about:blank')
  })
})
