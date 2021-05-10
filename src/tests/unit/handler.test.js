'use strict'

const { handler } = require('../../handler')
const chai = require('chai')
const expect = chai.expect

describe('Tests successful response when all query parameters are given', function () {
  const event = {
    query: {
      query: 'journal',
      year: 2021,
      start: 1
    }
  }

  describe('Test search response content', () => {
    it('verifies response is success and has a empty body', async function () {
      const response = await handler(event)
      expect(response).to.be.an('Object')
      expect(response.statusCode).to.equal(200)
      expect(response.body).to.equal('{}')
    })
  })
})

describe('Handler throws error when called', () => {
  it('verifies response is error 500 and  has Internal Server Error message', async function () {
    const calledPath = '/some.path'
    const event = { path: calledPath }
    const response = await handler(event)
    expect(response.statusCode).to.equal(500)
    const responseBody = JSON.parse(response.body)
    expect(responseBody.instance).to.equal(calledPath)
  })
})
