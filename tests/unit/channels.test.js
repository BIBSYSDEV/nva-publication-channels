'use strict'

const chai = require('chai')
const { searchHandler } = require('../../channels')
const expect = chai.expect

describe('Tests search for publication channel', function () {
  let result
  const event = {
    body: {
      tableId: 851,
      searchTerm: '%Journal%'
    }
  }

  describe('TestSimpleSearch', () => {
    it('verifies response is success and has a body', async function () {
      result = await searchHandler(event)
      expect(result).to.be.an('Array')
      expect(result).to.have.lengthOf(10)
    })
    console.log(result)
  })

  it('should be sucess', function () {
    console.log('is sucess')
    console.log(result)
    // expect(result.status).to.equal(200);
  })
})
