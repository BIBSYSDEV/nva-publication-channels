'use strict'

const RouteSpec = require('../../../routeSpec/RouteSpec')
const Routes = require('../../../routeSpec/Routes')
const QueryParameter = require('../../../routeSpec/QueryParameter')
const chai = require('chai')
const VALID_METHODS = require('../../../routeSpec/Constants')
const expect = chai.expect

const _VALID_TEMPLATE = 'queryTemplates/query_journal_template.json'
const _SIMPLE_ROUTE_SPEC = new RouteSpec('/journal', 'GET', [], [], _VALID_TEMPLATE)
const _INVALID_PATH_NO_SLASH = 'noSlash'
const _INVALID_PATH_TWO_SLASHES = '//twoSlashes'

describe('Valid route specs are validated', () => {
  it('returns true when a spec is matched', async function () {
    expect(_SIMPLE_ROUTE_SPEC.path).to.include('/journal')
  })
})

describe('Invalid paths are rejected', () => {
  [_INVALID_PATH_NO_SLASH, _INVALID_PATH_TWO_SLASHES].forEach(path => {
    it('throws error when a path does not match expectations', async function () {
      const error = () => new RouteSpec(path, 'GET', [], [], _VALID_TEMPLATE)
      const expected = `Invalid path definition: ${path}. The path should begin with a slash and be a valid URI segment`
      expect(error).to.throw(expected)
    })
  })
})

describe('Invalid path parameters are rejected', () => {
  it('throws error when a path parameters contain illegal characters', async function () {
    const invalidPath = [':wrong']
    const error = () => new RouteSpec('/ok', 'GET', invalidPath, [], _VALID_TEMPLATE)
    const expected = `Bad path parameters definition: ${JSON.stringify(invalidPath)}. The paths should be valid URI segments`
    expect(error).to.throw(expected)
  })
})

describe('Null path parameters are converted to array', () => {
  it('returns array when path parameters are null', async function () {
    const pathParameters = new RouteSpec('/ok', 'GET', null, [], _VALID_TEMPLATE).pathParameters
    expect(pathParameters).to.be.instanceof(Array)
    expect(pathParameters).to.have.length(0)
  })
})

describe('Null query parameters are converted to array', () => {
  it('returns array when query parameters are null', async function () {
    const queryParameters = new RouteSpec('/ok', 'GET', [], null, _VALID_TEMPLATE).queryParameters
    expect(queryParameters).to.be.instanceof(Array)
    expect(queryParameters).to.have.length(0)
  })
})

describe('Invalid methods are rejected', () => {
  it('throws error when a method is unrecognized', async function () {
    const invalidMethod = 'PORT'
    const error = () => new RouteSpec('/ok', invalidMethod, [], [], _VALID_TEMPLATE)
    expect(error).to.throw(`Invalid method definition: ${invalidMethod}. Valid methods: ${VALID_METHODS.toString()}`)
  })
})

describe('Invalid query parameter definitions are rejected', () => {
  it('throws error when a query parameter is badly defined', async function () {
    const invalidQueryParameters = [{ figs: 10 }]
    const error = () => new RouteSpec('/ok', 'POST', [], invalidQueryParameters, _VALID_TEMPLATE)
    const expected = `Invalid query parameters definition: ${JSON.stringify(invalidQueryParameters)}. Should be an array of QueryParameters`
    expect(error).to.throw(expected)
  })
})

describe('Valid templates are validated', async function () {
  it('returns true when a spec is validated', () => {
    expect(_SIMPLE_ROUTE_SPEC.template).to.include(_VALID_TEMPLATE)
  })
})

describe('Invalid templates are rejected', async function () {
  it('throws error when a spec is contains a template that does not exist', () => {
    const _INVALID_TEMPLATE = 'not_exist.json'
    expect(() => new RouteSpec('/ok', 'GET', [], [], _INVALID_TEMPLATE)).to.throw('Bad template definition: ' + _INVALID_TEMPLATE)
  })
})

describe('Valid events are recognized', () => {
  it('returns true when path is matched', async function () {
    const event = { path: '/journal', httpMethod: 'GET' }
    const matches = new Routes([_SIMPLE_ROUTE_SPEC]).matches(event)
    expect(matches).to.be.instanceof(RouteSpec)
    expect(matches).to.equal(_SIMPLE_ROUTE_SPEC)
  })
  it('returns true when method is matched', () => {
    const event = { path: '/journal', httpMethod: 'GET' }
    const routes = new Routes([_SIMPLE_ROUTE_SPEC])
    const matches = routes.matches(event)
    expect(matches).to.be.instanceof(RouteSpec)
    expect(matches).to.equal(_SIMPLE_ROUTE_SPEC)
  })
  it('returns true when no path parameters are present', () => {
    const event = { path: '/journal', httpMethod: 'GET', pathParameters: null }
    const routes = new Routes([_SIMPLE_ROUTE_SPEC])
    const matches = routes.matches(event)
    expect(matches).to.be.instanceof(RouteSpec)
    expect(matches).to.equal(_SIMPLE_ROUTE_SPEC)
  })
  it('returns true when path parameters are matched', () => {
    const event = { path: '/journal', httpMethod: 'GET', pathParameters: { hello: 'pounce', doggy: 'bland' } }
    const routeSpec = new RouteSpec('/journal', 'GET', ['hello', 'doggy'], [], _VALID_TEMPLATE)
    const routes = new Routes([routeSpec])
    const matches = routes.matches(event)
    expect(matches).to.be.instanceof(RouteSpec)
    expect(matches).to.equal(routeSpec)
  })
  it('returns true when query parameters are matched', () => {
    const event = { path: '/journal', httpMethod: 'GET', pathParameters: null, queryStringParameters: { hats: 'yes', suit: '44' } }
    const routeSpec = new RouteSpec('/journal', 'GET', [], [new QueryParameter('hats', true), new QueryParameter('suit', false)], _VALID_TEMPLATE)
    const routes = new Routes([routeSpec])
    const matches = routes.matches(event)
    expect(matches).to.be.instanceof(RouteSpec)
    expect(matches).to.equal(routeSpec)
  })
})

describe('Invalid events are recognized', () => {
  it('returns Error when path is not matched', async function () {
    const event = { path: '/publisher' }
    const routes = new Routes([_SIMPLE_ROUTE_SPEC])
    expect(() => routes.matches(event)).to.throw('The resource \'/publisher\' was not found')
  })
  it('returns Error when method is not matched', async function () {
    [{ spec: _SIMPLE_ROUTE_SPEC, event: { path: '/journal', httpMethod: 'POST' } }, { spec: new RouteSpec('/journal', 'GET', ['id', 'year'], null, _VALID_TEMPLATE), event: { path: '/journal', httpMethod: 'POST', pathParameters: { id: 213123, year: 2020 } } }].forEach(pair => {
      const routes = new Routes([pair.spec])
      expect(() => routes.matches(pair.event)).to.throw('Method Not Allowed')
    })
  })
  it('returns Error when path parameter is not matched', async function () {
    const event = { path: '/journal', httpMethod: 'GET', pathParameters: [{ mean: 'hats' }] }
    const routes = new Routes([_SIMPLE_ROUTE_SPEC])
    expect(() => routes.matches(event)).to.throw('The resource \'/journal/hats\' was not found')
  })
  it('returns Error when query parameter is unrecognized', async function () {
    const event = { path: '/journal', httpMethod: 'GET', pathParameters: null, queryStringParameters: { mean: 'hats' } }
    const routes = new Routes([_SIMPLE_ROUTE_SPEC])
    expect(() => routes.matches(event)).to.throw('Bad Request')
  })
})

describe('Misconfiguration causes generic errors', () => {
  it('returns Error when multiple routes match input', () => {
    const event = { path: '/journal', httpMethod: 'GET', pathParameters: null, queryStringParameters: [] }
    const routes = new Routes([_SIMPLE_ROUTE_SPEC, _SIMPLE_ROUTE_SPEC])
    expect(() => routes.matches(event)).to.throw('Internal server error')
  })
})
