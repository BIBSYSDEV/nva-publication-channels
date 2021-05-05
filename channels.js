'use strict'

const { fetch } = require('./fetchData')

function createRequestFromEvent (requestDetails) {
  return {
    tabell_id: requestDetails.tableId,
    api_versjon: 1,
    statuslinje: 'N',
    begrensning: 10,
    kodetekst: 'J',
    desimal_separator: '.',
    variabler: ['*'],
    sortBy: [],
    filter: [
      {
        variabel: 'Original Tittel',
        selection: {
          filter: 'like',
          values: [requestDetails.searchTerm]
        }
      }
    ]
  }
}

const searchHandler = async (event) => {
  try {
    console.log('REAL Channels')
    console.log(event)
    const request = createRequestFromEvent(JSON.parse(event.body))
    const responseBody = await fetch(request)
    console.log('status=' + responseBody.status)
    console.log('statusText=' + responseBody.statusText)
    console.log('response.data=')
    console.log(responseBody.data)
    const response = { statusCode: 200, body: JSON.stringify(responseBody.data) }
    return response
  } catch (err) {
    console.log('UPS Error!!!')
    console.log(err)
    return err
  }
}

exports.searchHandler = searchHandler
