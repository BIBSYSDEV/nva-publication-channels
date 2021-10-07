const RemoteResponse = require('./RemoteResponse')
const NvaLanguage = require('nva-language')

class RemoteJournalResponse extends RemoteResponse {
  constructor (host, identifier, year, name, website, level, active, onlineIssn, printIssn, npiDomain, openAccess, language, publisherId) {
    super(host, 'Journal', identifier, year, name, website, level, active)
    this.onlineIssn = onlineIssn
    this.printIssn = printIssn
    this.npiDomain = npiDomain
    this.openAccess = openAccess
    this.language = NvaLanguage.getLanguageByBokmaalName(language).uri
    this.publisherId = publisherId !== undefined && publisherId !== null && publisherId.trim() !== ''
      ? super.generateId(host, 'Publisher', publisherId, year)
      : null
  }
}

module.exports = RemoteJournalResponse
