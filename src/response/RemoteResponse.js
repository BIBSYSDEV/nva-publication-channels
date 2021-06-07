class RemoteResponse {
  constructor (type, identifier, year, name, website, level, active) {
    this['@context'] = 'https://bibsysdev.github.io/src/publication-channel/channel-context.json'
    this.id = this.generateId(type, identifier, year)
    this.type = type
    this.identifier = identifier
    this.name = name
    this.website = website
    this.level = level
    this.active = active === '1'
  }

  generateId (type, identifier, year) {
    return (identifier === null)
      ? null
      : `https://nva.unit.no/publicationchannel/${type.toLowerCase()}/${identifier}${(this._extractYear(year))}`
  }

  _extractYear (year) {
    return year !== null ? '/' + year : ''
  }
}

module.exports = RemoteResponse
