class Requestgenerator {
  constructor (event) {
    this.request = this.createRequest(event)
  }

  getRequest () {
    return this.request
  }

  createRequest (event) {
    const params = event.queryStringParameters
    let template
    if (event.path === '/journal') {
      template = queryJournalTemplate
    } else {
      template = queryPublisherTemplate
    }
    let filterValue = '%'
    if (params !== undefined && params.query !== undefined) {
      filterValue = '%' + params.query + '%'
    }
    template.filter[0].selection.values[0] = filterValue
    return template
  }
}

const queryJournalTemplate = {
  tabell_id: 851,
  api_versjon: 1,
  statuslinje: 'N',
  begrensning: 10,
  kodetekst: 'N',
  desimal_separator: '.',
  variabler: [
    'Tidsskrift id',
    'Original tittel',
    'Online ISSN',
    'Print ISSN',
    'Open Access',
    'Språk',
    'NPI Fagfelt',
    'Url',
    'Nivå 2020',
    'Etablert år',
    'Nedlagt år'
  ],
  sortBy: ['Original tittel'],
  filter: [
    {
      variabel: 'Original tittel',
      selection: {
        filter: 'like',
        values: [
          '%'
        ]
      }
    }
  ]
}

const queryPublisherTemplate = {
  tabell_id: 850,
  api_versjon: 1,
  statuslinje: 'N',
  begrensning: 10,
  kodetekst: 'N',
  desimal_separator: '.',
  variabler: [
    'Original tittel',
    'Forlag id',
    'ISBN-prefiks',
    'Url',
    'Aktiv'
  ],
  sortBy: [
    'Original tittel'
  ],
  filter: [
    {
      variabel: 'Original tittel',
      selection: {
        filter: 'like',
        values: [
          '%'
        ]
      }
    }
  ]
}

module.exports = { Requestgenerator }
