'use strict'

const variableSet = (year) => {
  return Object.freeze({
    JOURNAL_ID: 'Tidsskrift id',
    ORIGINAL_TITLE: 'Original tittel',
    ONLINE_ISSN: 'Online ISSN',
    PRINT_ISSN: 'Print ISSN',
    OPEN_ACCESS: 'Open Access',
    LANGUAGE: 'Språk',
    NPI_DOMAIN: 'NPI Fagfelt',
    WEBSITE: 'Url',
    LEVEL: `Nivå ${year}`,
    ACTIVE: 'Aktiv',
    PUBLISHER: 'Utgiver',
    PUBLISHER_ID: 'Forlag id'
  })
}

const wildcardQuery = query => `%${query}%`

const journalProjection = (variable) => [
  variable.JOURNAL_ID,
  variable.ORIGINAL_TITLE,
  variable.ONLINE_ISSN,
  variable.PRINT_ISSN,
  variable.OPEN_ACCESS,
  variable.LANGUAGE,
  variable.NPI_DOMAIN,
  variable.WEBSITE,
  variable.LEVEL,
  variable.ACTIVE,
  variable.PUBLISHER,
  variable.PUBLISHER_ID
]

const publisherProjection = (variable) => [
  variable.PUBLISHER_ID,
  variable.ORIGINAL_TITLE,
  variable.LEVEL,
  variable.WEBSITE,
  variable.ACTIVE
]

module.exports = { variableSet, wildcardQuery, journalProjection, publisherProjection }
