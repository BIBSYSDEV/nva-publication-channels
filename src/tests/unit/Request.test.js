const requestGenerator = require('../../Request')
const chai = require('chai')
const expect = chai.expect

describe('Testing getter and setter in Request class for code coverage', () => {
  it('testing getter in request body and verify table_id', async function () {
    const queryParameters = { path: '/journal', queryStringParameters: { query: 'query' } }
    const nsdRequest = new requestGenerator.Request(queryParameters)
    const request = nsdRequest.request
    const TABLE_ID_FOUND_IN_TEMPLATE_FILE = 851
    expect(request.tabell_id).to.equal(TABLE_ID_FOUND_IN_TEMPLATE_FILE)
  })
  it('testing setter in request ', async function () {
    const queryParameters = { path: '/journal', queryStringParameters: { query: 'query' } }
    const nsdRequest = new requestGenerator.Request(queryParameters)
    const TABLE_ID_FOUND_IN_TEMPLATE_FILE = 123
    nsdRequest.request = { tabell_id: TABLE_ID_FOUND_IN_TEMPLATE_FILE }
    const request = nsdRequest.request
    expect(request.tabell_id).to.equal(TABLE_ID_FOUND_IN_TEMPLATE_FILE)
  })
})
