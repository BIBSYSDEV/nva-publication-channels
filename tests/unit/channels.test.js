'use strict'

const chai = require('chai')
const { searchHandler } = require('../../channels')
const expect = chai.expect

describe('Tests successful search for channel when all parameters are given', function () {
  let result
  const event = {
    body: {
      tableId: 851,
      searchTerm: '%Journal%'
    }
  }

  describe('Test search response content', () => {
    it('verifies response is success and has a body', async function () {
      result = await searchHandler(event)
      expect(result).to.be.an('Array')
      expect(result).to.have.lengthOf(10)
    })
    console.log(result)
  })

  it('result.status should be http.StatusOK', function () {
    expect(result.status).to.equal(200)
  })
})
