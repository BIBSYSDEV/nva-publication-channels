const RemoteResponse = require('./RemoteResponse')

class RemoteJournalResponse extends RemoteResponse {
  constructor (identifier, year, name, website, level, active, onlineIssn, printIssn, npiDomain, openAccess, language, publisher) {
    super('Journal', identifier, year, name, website, level, active)
    this.onlineIssn = onlineIssn
    this.printIssn = printIssn
    this.npiDomain = npiDomain
    this.openAccess = openAccess
    this.language = language
    this.publisher = super.generateId('Publisher', publisher, null)
  }
}

module.exports = RemoteJournalResponse