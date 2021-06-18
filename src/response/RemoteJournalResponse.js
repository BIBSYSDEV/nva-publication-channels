const RemoteResponse = require('./RemoteResponse')

class RemoteJournalResponse extends RemoteResponse {
  constructor (host, identifier, year, name, website, level, active, onlineIssn, printIssn, npiDomain, openAccess, language, publisher) {
    super(host, 'Journal', identifier, year, name, website, level, active)
    this.onlineIssn = onlineIssn
    this.printIssn = printIssn
    this.npiDomain = npiDomain
    this.openAccess = openAccess
    this.language = language
    this.publisher = publisher !== undefined && publisher !== null && publisher.trim() !== ''
      ? super.generateId(host, 'Publisher', publisher, year)
      : null
  }
}

module.exports = RemoteJournalResponse
