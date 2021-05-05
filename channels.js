'use strict'

const { fetch } = require('./fetchData')

function createRequestFromEvent (event) {
  return {
    tabell_id: event.tableId,
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
          values: [event.searchTerm]
        }
      }
    ]
  }
}

const searchHandler = async (event) => {
  let data
  try {
    console.log('REAL Channels')
    console.log(event)
    const request = createRequestFromEvent(event)
    const response = await fetch(request)
    data = response.data
    console.log('status=' + response.status)
    console.log('statustext=' + response.statusText)
    console.log('(channels.searchHandler response.data=')
    console.log(response.data)
  } catch (err) {
    console.log('UPS Error!!!')
    console.log(err)
    return err
  }
  return data
}

exports.searchHandler = searchHandler
