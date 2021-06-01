const requestGenerator = require('../../Request')
const chai = require('chai')
const expect = chai.expect

describe('Testing getter and setter in Request class for code coverage', () => {
  it('testing getter in request body and verify table_id', async function () {
    const queryParameters = { path: '/journal', queryStringParameters: { query: 'query' } }
    const nsdRequest = new requestGenerator.Request(queryParameters)
    const request = nsdRequest.request
    expect(request.tabell_id).to.equal(851)
  })
  it('testing setter in request ', async function () {
    const queryParameters = { path: '/journal', queryStringParameters: { query: 'query' } }
    const nsdRequest = new requestGenerator.Request(queryParameters)
    nsdRequest.request = { tabell_id: 123 }
    const request = nsdRequest.request
    expect(request.tabell_id).to.equal(123)
  })
})
