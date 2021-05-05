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
    const response = await fetch(request)
    console.log('status=' + response.status)
    console.log('statusText=' + response.statusText)
    console.log('response.data=')
    console.log(response.data)
    return response.data
  } catch (err) {
    console.log('UPS Error!!!')
    console.log(err)
    return err
  }
}

exports.searchHandler = searchHandler
