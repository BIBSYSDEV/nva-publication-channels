'use strict'

const { searchHandler } = require('../../__mocks__/channels')
const chai = require('chai')
const expect = chai.expect

describe('Tests successful search for channel when all parameters are given', function () {
  const event = {
    body: {
      tableId: 851,
      searchTerm: '%journal%'
    }
  }

  describe('Test search response content', () => {
    it('verifies response is success and has a body', async function () {
      const result = await searchHandler(event)
      expect(result).to.be.an('Object')
      expect(result.data).to.have.lengthOf(10)
      expect(result.status).to.equal(200)
    })
  })
})
