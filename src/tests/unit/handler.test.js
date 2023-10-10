'use strict'
const chaiJson = require('chai-json-equal')
const handler = require('../../handler')
const chai = require('chai')
chai.use(chaiJson)
chai.use(require('chai-string'))
const expect = chai.expect
const httpStatus = require('http-status-codes')
const fs = require('fs')
const httpServerMock = require('nock')
const { NO_CONTENT, OK } = require('http-status-codes')
const journalRemoteResponseData = fs.readFileSync(
  'tests/unit/journal_response.json').toString()
const journalRemoteResponseDataWithPublisher = fs.readFileSync(
  'tests/unit/journal_response_with_publisher.json').toString()
const journalRemoteResponseDataWithoutPublisher = fs.readFileSync(
  'tests/unit/journal_response_without_publisher.json').toString()
const publisherRemoteResponseData = fs.readFileSync(
  'tests/unit/publisher_response.json').toString()
const singleJournalContent = fs.readFileSync(
  'tests/unit/single_journal.json').toString()
const singlePublisherContent = fs.readFileSync(
  'tests/unit/single_publisher.json').toString()
const journalIssnRemoteResponseData = fs.readFileSync(
  'tests/unit/issn_journal_response.json').toString()
const DbhServerAddress = 'https://kanalregister.hkdir.no/'
const DbhQueryPath = '/api/krtabeller/hentJSONTabellData'

const APPLICATION_JSON = 'application/json'
const HOST_DOMAIN = 'api.nva.dev.aws.unit.no'
const HOST_BASEPATH = 'publication-channels'
const EXPECTED_DOMAIN_URI = `https://${HOST_DOMAIN}/${HOST_BASEPATH}`

const dbhMockReturns = (statusCode, returnValue) => {
  httpServerMock.cleanAll()
  httpServerMock(DbhServerAddress,
    { reqheaders: { 'content-type': 'application/json' } })
    .post(DbhQueryPath, () => {
      return true
    })
    .reply(statusCode, returnValue)
}

const dbhMockReturnsRequestBodyMatch = (statusCode, returnValue, firstMatch, secondMatch) => {
  httpServerMock.cleanAll()
  httpServerMock(DbhServerAddress,
    { reqheaders: { 'content-type': 'application/json' } })
    .post(DbhQueryPath, firstMatch)
    .reply(NO_CONTENT, '')
    .post(DbhQueryPath, secondMatch)
    .reply(OK, returnValue)
}

const createTestEvent = (acceptType, httpMethod, resource, pathParameters, queryParameters, domainName = HOST_DOMAIN) => {
  return {
    requestContext: { domainName: domainName },
    headers: { Accept: acceptType },
    httpMethod: httpMethod,
    resource: resource,
    pathParameters: pathParameters,
    queryStringParameters: queryParameters
  }
}

describe('Handler expected behavior', function () {
  beforeEach(function () {
    process.env.DOMAIN = HOST_DOMAIN
    process.env.BASEPATH = HOST_BASEPATH
  })

  describe('Handler throws error when called without path', () => {
    it('verifies response is error 404 and has Not Found message',
      async function () {
        const event = {
          headers: { Accept: APPLICATION_JSON },
          failing: 'call',
          httpMethod: 'GET'
        }
        const response = await handler.handler(event)
        expect(response.statusCode).to.equal(httpStatus.NOT_FOUND)
        const responseBody = JSON.parse(response.body)
        expect(responseBody.instance).to.equal('Undefined path')
        expect(responseBody.status).to.equal(httpStatus.NOT_FOUND)
        expect(responseBody.detail).to.equal(
          'The requested resource Undefined path could not be found')
        expect(responseBody.title).to.equal('Not Found')
        expect(responseBody.type).to.equal('about:blank')
      })
  })

  describe('Handler returns 404 on unsupported path', () => {
    const calledPath = '/non-existent'
    it(`return 404 when ${calledPath} is called`, async function () {
      const event = createTestEvent(APPLICATION_JSON, 'GET', calledPath, null,
        {
          year: '2020',
          id: '1231'
        })
      const response = await handler.handler(event)
      expect(response.statusCode).to.equal(404)
      const responseBody = JSON.parse(response.body)
      expect(responseBody.instance).to.equal(calledPath + '?year=2020&id=1231')
      expect(responseBody.status).to.equal(404)
      expect(responseBody.detail).to.equal(
        `The requested resource ${calledPath}?year=2020&id=1231 could not be found`)
      expect(responseBody.title).to.equal('Not Found')
      expect(responseBody.type).to.equal('about:blank')
    })
  })

  describe('Handler verifies GET existing paths', () => {
    ['/journal', '/publisher'].map(calledPath => (
      it(`GET ${calledPath} returns 200 OK`, async function () {
        dbhMockReturns(httpStatus.OK, journalRemoteResponseData)
        const queryStringParameters = {
          query: 'query-whatever',
          year: 2020
        }
        const event = createTestEvent(APPLICATION_JSON, 'GET', calledPath,
          null, queryStringParameters)
        const response = await handler.handler(event)
        expect(response.statusCode).to.equal(httpStatus.OK)
        expect(response.body).to.be.a('string')
      })
    ))
  })

  describe('Handler throws 405 when httpMethod is not GET', () => {
    ['HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE',
      'PATCH'].map(calledMethod => (
      it(`httpMethod ${calledMethod} returns 405`, async function () {
        const event = createTestEvent(APPLICATION_JSON, calledMethod,
          '/journal', null, null)
        const response = await handler.handler(event)
        const responseBody = JSON.parse(response.body)
        expect(responseBody.instance).to.equal('/journal')
        expect(responseBody.status).to.equal(httpStatus.METHOD_NOT_ALLOWED)
        expect(responseBody.detail).to.equal(
          `The requested http method  ${calledMethod} is not supported`)
        expect(responseBody.title).to.equal('Method Not Allowed')
        expect(responseBody.type).to.equal('about:blank')
      })
    ))
  })

  describe('Handler throws error when called with queryStringParameters',
    () => {
      it('verifies response is error 400 and has Bad Request problem response',
        async function () {
          const queryStringParameters = { 'sample.query.string.parameter': 'flox' }
          const event = createTestEvent(APPLICATION_JSON, 'GET',
            '/journal', null, queryStringParameters)
          const response = await handler.handler(event)
          expect(response.statusCode).to.equal(httpStatus.BAD_REQUEST)
          const responseBody = JSON.parse(response.body)
          const parametersAsString = '?sample.query.string.parameter=flox'
          expect(responseBody.instance).to.equal(
            `/journal${parametersAsString}`)
          expect(responseBody.status).to.equal(400)
          expect(responseBody.detail).to.equal(
            `Your request cannot be processed because the supplied parameter(s) ${parametersAsString} cannot be understood`)
          expect(responseBody.title).to.equal('Bad Request')
          expect(responseBody.type).to.equal('about:blank')
        })
    })

  describe('Handler sets different \'Content-type\' in response headers',
    () => {
      const queryStringParameters = {
        query: 'query-whatever',
        year: '2020'
      }
      const acceptTypes = [APPLICATION_JSON, 'application/ld+json']
      acceptTypes.map(acceptType => (
        it(`returns 'Content-Type' ${acceptType} when response code is 200`,
          async function () {
            dbhMockReturns(httpStatus.OK, journalRemoteResponseData)
            const event = createTestEvent(acceptType, 'GET', '/journal',
              null, queryStringParameters)

            const response = await handler.handler(event)
            expect(response.statusCode).to.equal(httpStatus.OK)
            expect(response.headers).to.have.property('Content-Type')
            expect(response.headers['Content-Type']).to.equal(acceptType)
          })
      ))
    })

  describe('Handler problem+json irrespective of accecpt type headers ', () => {
    const queryStringParameters = {
      query: 'query-whatever',
      year: '2020'
    }
    const acceptTypes = [APPLICATION_JSON, 'application/ld+json']
    acceptTypes.map(acceptType => (
      it(
        'returns \'Content-Type\' \'application/problem+json\' when error occurs',
        async function () {
          dbhMockReturns(httpStatus.NOT_FOUND, journalRemoteResponseData)
          const event = createTestEvent(acceptType, 'GET', '/journal', null,
            queryStringParameters)
          const response = await handler.handler(event)
          expect(response.statusCode).to.equal(httpStatus.NOT_FOUND)
          expect(response.headers).to.have.property('Content-Type')
          expect(response.headers['Content-Type']).to.equal(
            'application/problem+json')
        })
    ))
  })

  describe(
    'Handler verifies queryStringParameters and returns 200 with empty body when called with specified queryStringParameters',
    () => {
      const queryYear = '2020'
      const expectedHost = `https://${HOST_DOMAIN}/${HOST_BASEPATH}`
      it('Returns 200 OK and a empty body when only "query" parameter is set',
        async function () {
          dbhMockReturns(httpStatus.OK, journalRemoteResponseData)
          const queryStringParameters = {
            query: 'query-journal',
            year: queryYear
          }
          const event = createTestEvent(APPLICATION_JSON, 'GET',
            '/journal', null, queryStringParameters)

          const response = await handler.handler(event)
          expect(response.statusCode).to.equal(httpStatus.OK)
          const actual = JSON.parse(response.body)
          expect(actual[0].id).to.equal(
            `${expectedHost}/journal/journal-1/${queryYear}`)
          expect(actual[0].type).to.equal('Journal')
          expect(actual[0].identifier).to.equal('journal-1')
          expect(actual[0].name).to.equal(
            'Alzheimer Disease and Associated Disorders')
          expect(actual[0].website).to.equal(
            'https://journals.lww.com/alzheimerjournal')
          expect(actual[0].level).to.equal('1')
          expect(actual[0].active).to.equal(true)
          expect(actual[0].onlineIssn).to.equal('1546-4156')
          expect(actual[0].printIssn).to.equal('0893-0341')
          expect(actual[0].npiDomain).to.equal('Nevrologi')
          expect(actual[0].openAccess).to.equal(null)
          expect(actual[0].language).to.equal('http://lexvo.org/id/iso639-3/und')
          expect(actual[0].publisherId).to.equal(null)
        })
      it('returns 200 OK and a empty body when all parameters set',
        async function () {
          dbhMockReturns(httpStatus.OK, publisherRemoteResponseData)
          const queryStringParameters = {
            query: 'query-publisher',
            year: queryYear
          }
          const event = createTestEvent(APPLICATION_JSON, 'GET',
            '/publisher', null, queryStringParameters)

          const response = await handler.handler(event)
          expect(response.statusCode).to.equal(httpStatus.OK)
          const actual = JSON.parse(response.body)
          expect(actual[0].id).to.equal(`${expectedHost}/publisher/publisher-1/${queryYear}`)
          expect(actual[0].type).to.equal('Publisher')
          expect(actual[0].identifier).to.equal('publisher-1')
          expect(actual[0].name).to.equal('T & AD Poyser')
          expect(actual[0].website).to.equal('http://www.poyserbooks.co.uk/')
          expect(actual[0].level).to.equal('1')
          expect(actual[0].active).to.equal(true)
        })
    })

  describe('Handler returns bad request when error in query ', () => {
    it('returns 400 Bad Request when obligatory "query"-parameter is missing',
      async function () {
        dbhMockReturns(httpStatus.BAD_REQUEST, '')
        const queryStringParameters = {
          year: 2020,
          start: 1
        }
        const event = createTestEvent(APPLICATION_JSON, 'GET', '/journal',
          null, queryStringParameters)
        const response = await handler.handler(event)
        expect(response.statusCode).to.equal(httpStatus.BAD_REQUEST)
      })
    it('returns 400 Bad Request when extra unknown parameter is added',
      async function () {
        dbhMockReturns(httpStatus.BAD_REQUEST, '')
        const queryStringParameters = {
          query: 'query',
          year: 2020,
          start: 1,
          unsupportedParameter: 'error'
        }
        const event = createTestEvent(APPLICATION_JSON, 'GET', '/journal',
          null, queryStringParameters)
        const response = await handler.handler(event)
        expect(response.statusCode).to.equal(httpStatus.BAD_REQUEST)
      })
    it('returns 400 Bad Request when value of query parameter is empty string',
      async function () {
        dbhMockReturns(httpStatus.BAD_REQUEST, '')
        const queryStringParameters = { query: '' }
        const event = createTestEvent(APPLICATION_JSON, 'GET', '/journal',
          null, queryStringParameters)
        const response = await handler.handler(event)
        expect(response.statusCode).to.equal(httpStatus.BAD_REQUEST)
      })
    it('returns 400 Bad Request when value of query parameter is null',
      async function () {
        dbhMockReturns(httpStatus.BAD_REQUEST, '')
        const queryStringParameters = { query: null }
        const event = createTestEvent(APPLICATION_JSON, 'GET', '/journal',
          null, queryStringParameters)
        const response = await handler.handler(event)
        expect(response.statusCode).to.equal(httpStatus.BAD_REQUEST)
      })
    it('returns 400 Bad Request when value of query string parameters is null',
      async function () {
        dbhMockReturns(httpStatus.BAD_REQUEST, '')
        const queryStringParameters = null
        const event = createTestEvent(APPLICATION_JSON, 'GET', '/journal',
          null, queryStringParameters)
        const response = await handler.handler(event)
        expect(response.statusCode).to.equal(httpStatus.BAD_REQUEST)
        expect(JSON.parse(response.body).instance).to.equal('/journal')
      })
  })

  describe('Handler returns response 200 OK when called', () => {
    ['/journal', '/publisher'].map(calledPath => (
      it(`returns 200 OK for ${calledPath}`, async function () {
        dbhMockReturns(httpStatus.OK, journalRemoteResponseData)
        const queryStringParameters = {
          query: 'query-whatever',
          year: 2020
        }
        const event = createTestEvent(APPLICATION_JSON, 'GET', calledPath,
          null, queryStringParameters)

        const response = await handler.handler(event)
        expect((await response).statusCode).to.equal(httpStatus.OK)
      })
    ))
  })

  describe(
    'Handler returns response 200 OK when called with correct query which gives 0 hits',
    () => {
      ['/journal', '/publisher'].map(calledPath => (
        it(`returns 200 OK for ${calledPath}`, async function () {
          dbhMockReturns(httpStatus.NO_CONTENT, '')
          const queryStringParameters = {
            query: 'not-to-be-found',
            year: 2020
          }
          const event = createTestEvent(APPLICATION_JSON, 'GET',
            calledPath, null, queryStringParameters)
          const response = await handler.handler(event)
          expect((await response).statusCode).to.equal(httpStatus.OK)
        })
      ))
    })

  describe(
    'Handler returns response 404 Not Found when called with path parameters with 0 hits',
    () => {
      ['/journal/not-to-be-found-identifier/1234',
        '/publisher/not-to-be-found-identifier/1234'].map(
        calledPath => it(`returns 404 Not found for ${calledPath}`,
          async function () {
            dbhMockReturns(httpStatus.NO_CONTENT, '')
            const pathParameters = {
              id: 'not-to-be-found-identifier',
              year: '1234'
            }
            const event = createTestEvent(APPLICATION_JSON, 'GET',
              calledPath, pathParameters, null)
            const response = await handler.handler(event)
            expect(response.statusCode).to.equal(httpStatus.NOT_FOUND)
            expect(JSON.parse(response.body).instance).to.equal(
              calledPath)
          }))
    })

  describe(
    'Handler returns response 400 Not Found when called with missing path parameters ',
    () => {
      ['/journal/iiiii', '/publisher/iiiii'].map(calledPath => (
        it(`returns 400 Bad Request for ${calledPath}`, async function () {
          const pathParameters = { id: 'iiiii' }
          const event = createTestEvent(APPLICATION_JSON, 'GET',
            calledPath, pathParameters, null)
          const response = await handler.handler(event)
          expect(response.statusCode).to.equal(httpStatus.BAD_REQUEST)
          expect(JSON.parse(response.body).instance).to.equal(calledPath)
        })
      ))
    })

  describe('Handler returns error when remote call fails', () => {
    it('response 502 when remote server responds with error 502 ',
      async function () {
        dbhMockReturns(httpStatus.BAD_GATEWAY, '')
        const queryStringParameters = {
          query: 'throw-remote-error-502',
          year: 2020
        }
        const event = createTestEvent(APPLICATION_JSON, 'GET', '/journal',
          null, queryStringParameters)
        const response = await handler.handler(event)
        expect(response.statusCode).to.equal(httpStatus.BAD_GATEWAY)
        expect(response.body).to.contain(
          'Your request cannot be processed at this time due to an upstream error')
      })
    it('response 504 when remote server timeout', async function () {
      dbhMockReturns(httpStatus.GATEWAY_TIMEOUT, '')
      const queryStringParameters = {
        query: 'throw-remote-error-504',
        year: 2020
      }
      const event = createTestEvent(APPLICATION_JSON, 'GET', '/journal', null,
        queryStringParameters)
      const response = await handler.handler(event)
      expect(response.statusCode).to.equal(httpStatus.GATEWAY_TIMEOUT)
      expect(response.body).to.contain(
        'Your request cannot be processed at this time because the upstream server response took too long')
    })
    it('Handler echoes remote error', async function () {
      dbhMockReturns(httpStatus.INTERNAL_SERVER_ERROR, '')
      const queryStringParameters = {
        query: 'throw-remote-error-500',
        year: 2020
      }
      const event = createTestEvent(APPLICATION_JSON, 'GET', '/journal', null,
        queryStringParameters)
      const response = await handler.handler(event)
      expect(response.statusCode).to.equal(httpStatus.INTERNAL_SERVER_ERROR)
      expect(response.body).to.contain('Internal Server Error')
    })
  })

  describe('Handler returns response 200 OK when found', () => {
    const year = '2020'
    it('returns 200 OK for /journal', async function () {
      const identifier = 'journal-1'
      dbhMockReturns(httpStatus.OK, singleJournalContent)
      const path = `/journal/${identifier}/${year}`
      const pathParameters = {
        id: identifier,
        year: year
      }
      const event = createTestEvent(APPLICATION_JSON, 'GET', path,
        pathParameters, null)
      const response = await handler.handler(event)
      expect(response.statusCode).to.equal(httpStatus.OK)
      expect(response.body).to.contain(identifier)
    })
    it('returns 200 OK for /publisher', async function () {
      const identifier = 'publisher-1'
      dbhMockReturns(httpStatus.OK, singlePublisherContent)
      const path = `/publisher/${identifier}/${year}`
      const pathParameters = {
        id: identifier,
        year: year
      }
      const event = createTestEvent(APPLICATION_JSON, 'GET', path,
        pathParameters, null)
      const response = await handler.handler(event)
      expect((await response).statusCode).to.equal(httpStatus.OK)
      expect(response.body).to.contain(identifier)
    })
  })

  describe('Handler returns 200 OK when searching for ISSNs', () => {
    it('returns 200 OK when an ISSN match is found', async () => {
      const issn = '2328-0700'
      dbhMockReturnsRequestBodyMatch(httpStatus.NO_CONTENT, journalIssnRemoteResponseData, /.*variabel":"Online ISSN.*/g, /.*variabel":"Print ISSN.*/g)

      const queryStringParameters = {
        query: issn,
        year: '2020'
      }
      const event = createTestEvent(APPLICATION_JSON, 'GET', '/journal', null,
        queryStringParameters)

      const response = await handler.handler(event)
      expect((await response).statusCode).to.equal(httpStatus.OK)
      expect(response.body).to.contain('2328-0700')
    })
  })

  describe(
    'Handler returns status code 406 and problem+json body when accept type is not acceptable',
    () => {
      const contentType = 'application/pdf'
      const queryParameters = {
        query: 'irrelevant',
        year: '2020'
      }
      const pathParameters = {
        id: '11111',
        year: '2020'
      }
      const allEvents = [
        createTestEvent(contentType, 'GET', '/journal', null,
          queryParameters),
        createTestEvent(contentType, 'GET', '/journal/11111/2020',
          pathParameters, null),
        createTestEvent(contentType, 'GET', '/publisher', null,
          queryParameters),
        createTestEvent(contentType, 'GET', '/publisher/11111/2020',
          pathParameters, null)
      ]
      allEvents.forEach(event => {
        it(`returns 406 when the accept header is '${contentType}'`,
          async () => {
            const response = await handler.handler(event)
            expect(response.statusCode).to.equal(httpStatus.NOT_ACCEPTABLE)
            expect(response.headers['Content-Type']).to.equal(
              'application/problem+json')
            const problem = JSON.parse(response.body)
            expect(problem.title).to.equal('Not Acceptable')
            expect(problem.instance).to.contain(event.resource)
            expect(problem.type).to.equal('about:blank')
            expect(problem.detail).to.equal(
              `Your request cannot be processed because the supplied content-type in the "Accept" header "${contentType}" cannot be understood, acceptable types: application/ld+json, application/json`)
          })
      })
    })

  describe(
    'Handler returns application/ld+json with deployment path as part of id for responsedata when request is for Publisher',
    () => {
      const contentType = 'application/ld+json'
      const queryParameters = {
        query: 'irrelevant',
        year: '2020'
      }
      const pathParameters = {
        id: '11111',
        year: '2020'
      }
      const allEventsAndResponses = [
        {
          event: createTestEvent(contentType, 'GET', '/publisher', null,
            queryParameters, HOST_DOMAIN),
          expectedResponse: publisherRemoteResponseData
        },
        {
          event: createTestEvent(contentType, 'GET', '/publisher/11111/2020',
            pathParameters, null, HOST_DOMAIN),
          expectedResponse: publisherRemoteResponseData
        }
      ]
      allEventsAndResponses.forEach(event => {
        it(
          `returns 200 OK and deployment path as part of id for ${event.event.path} `,
          async () => {
            dbhMockReturns(httpStatus.OK, event.expectedResponse)
            const response = await handler.handler(event.event)
            expect(response.statusCode).to.equal(httpStatus.OK)
            expect(response.headers['Content-Type']).to.equal(
              'application/ld+json')
            const hits = JSON.parse(response.body)
            if (Array.isArray(hits)) {
              hits.forEach(hit => {
                expect(hit.id).to.startsWith(EXPECTED_DOMAIN_URI)
              })
            } else {
              expect(hits.id).to.startsWith(EXPECTED_DOMAIN_URI)
            }
          })
      })
    })

  describe(
    'Handler returns application/ld+json with deployment path as part of id for responsedata for Journal',
    () => {
      const contentType = 'application/ld+json'
      const queryParameters = {
        query: 'irrelevant',
        year: '2020'
      }
      const testEvent = createTestEvent(contentType, 'GET', '/journal', null,
        queryParameters)
      it(
        `returns 200 OK and deployment path as part of id for ${testEvent.path} when it has publisher `,
        async () => {
          const publisherId = 'publisher-1'
          const returnValueWithPublisher = JSON.parse(
            journalRemoteResponseDataWithPublisher)
          returnValueWithPublisher[0]['Forlag id'] = publisherId
          dbhMockReturns(httpStatus.OK,
            JSON.stringify(returnValueWithPublisher))
          const response = await handler.handler(testEvent)
          expect(response.statusCode).to.equal(httpStatus.OK)
          expect(response.headers['Content-Type']).to.equal(
            'application/ld+json')
          const hits = JSON.parse(response.body)
          hits.forEach(hit => {
            expect(hit.id).to.startsWith(EXPECTED_DOMAIN_URI)
            expect(hit.publisherId).to.startsWith(EXPECTED_DOMAIN_URI)
            expect(hit.publisherId).to.contain(publisherId)
          })
        })
      it(
        `returns 200 OK and deployment path as part of id for ${testEvent.path} when it does not have publisher `,
        async () => {
          const expectedPublisherId = null
          const inputForlagIds = [null, undefined, '']
          inputForlagIds.forEach(async (inputForlagId) => {
            const returnValue = JSON.parse(
              journalRemoteResponseDataWithoutPublisher)
            returnValue['forlag id'] = inputForlagId
            dbhMockReturns(httpStatus.OK, JSON.stringify(returnValue))
            const response = await handler.handler(testEvent)
            expect(response.statusCode).to.equal(httpStatus.OK)
            expect(response.headers['Content-Type']).to.equal(
              'application/ld+json')
            const hits = JSON.parse(response.body)
            hits.forEach(hit => {
              expect(hit.id).to.startsWith(EXPECTED_DOMAIN_URI)
              expect(hit.publisherId).to.equal(expectedPublisherId)
            })
          })
        })
    })

  describe('Handler returns single result object for GET on Id + YEAR', () => {
    it('returns 200 OK and single result when match is found for journal', async () => {
      const identifier = 111111
      const year = 2020
      const path = `/journal/${identifier}/${year}`
      const pathParameters = {
        id: `${identifier} `,
        year: `${year}`
      }
      dbhMockReturns(httpStatus.OK, singleJournalContent)
      const event = createTestEvent(APPLICATION_JSON, 'GET', path, pathParameters, null)
      const response = await handler.handler(event)
      expect((await response).statusCode).to.equal(httpStatus.OK)
      const hits = JSON.parse(response.body)
      expect(Array.isArray(hits)).to.equal(false)
    })
    it('returns 200 OK and single result when match is found for publisher', async () => {
      const identifier = 111111
      const year = 2020
      const path = `/publisher/${identifier}/${year}`
      const pathParameters = {
        id: `${identifier} `,
        year: `${year}`
      }
      dbhMockReturns(httpStatus.OK, publisherRemoteResponseData)
      const event = createTestEvent(APPLICATION_JSON, 'GET', path, pathParameters, null)
      const response = await handler.handler(event)
      expect((await response).statusCode).to.equal(httpStatus.OK)
      const hits = JSON.parse(response.body)
      expect(Array.isArray(hits)).to.equal(false)
    })
  })

  describe('Handler returns 400 BAD_REQUEST when GET on Id + YEAR and year is a invalid number', () => {
    const identifier = '111111'
    const year = '2xda'
    it('returns 400 BAD_REQUEST when year is invalid for journal', async () => {
      const path = `/journal/${identifier}/${year}`
      const pathParameters = { id: `${identifier}`, year: `${year}` }
      dbhMockReturns(httpStatus.OK, singleJournalContent)
      const event = createTestEvent(APPLICATION_JSON, 'GET', path, pathParameters, null)
      const response = await handler.handler(event)
      expect((await response).statusCode).to.equal(httpStatus.BAD_REQUEST)
    })
    it('returns 400 BAD_REQUEST when year is invalid for publisher', async () => {
      const path = `/publisher/${identifier}/${year}`
      const pathParameters = { id: `${identifier}`, year: `${year}` }
      dbhMockReturns(httpStatus.OK, publisherRemoteResponseData)
      const event = createTestEvent(APPLICATION_JSON, 'GET', path, pathParameters, null)
      const response = await handler.handler(event)
      expect((await response).statusCode).to.equal(httpStatus.BAD_REQUEST)
    })
  })
})
