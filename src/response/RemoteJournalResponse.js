const RemoteResponse = require('./RemoteResponse')

class RemoteJournalResponse extends RemoteResponse {
  constructor (host, identifier, year, name, website, level, active, onlineIssn, printIssn, npiDomain, openAccess, language, publisherId, publisher) {
    super(host, 'Journal', identifier, year, name, website, level, active)
    this.onlineIssn = onlineIssn
    this.printIssn = printIssn
    this.npiDomain = npiDomain
    this.openAccess = openAccess
    this.language = language
    this.publisherId = publisherId !== undefined && publisherId !== null && publisherId.trim() !== ''
      ? super.generateId(host, 'Publisher', publisherId, year)
      : null
    this.publisher = publisher
  }
}

module.exports = RemoteJournalResponse
