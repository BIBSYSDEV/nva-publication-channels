'use strict'

const client = require('../../client')
const chai = require('chai')
const expect = chai.expect

describe('Client adds body to response', () => {
  const emptyBodyString = '{}'
  it('client adds empty body to response when no body given', async function () {
    const response = client.responseWithBody()
    expect(response.body).to.equal(emptyBodyString)
  })
  it('client assigns empty body to response when empty body given', async function () {
    const response = client.responseWithBody(JSON.parse(emptyBodyString))
    expect(response.body).to.equal(emptyBodyString)
  })
})
