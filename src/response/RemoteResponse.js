class RemoteResponse {
  constructor (host, type, identifier, year, name, website, level, active) {
    this['@context'] = 'https://bibsysdev.github.io/src/publication-channel/channel-context.json'
    this.id = this.generateId(host, type, identifier, year)
    this.type = type
    this.identifier = identifier
    this.name = name
    this.website = website
    this.level = level
    this.active = active === '1'
  }

  generateId (host, type, identifier, year) {
    return (identifier === null)
      ? null
      : `${host}/${type.toLowerCase()}/${identifier}${(this._extractYear(year))}`
  }

  _extractYear (year) {
    return year !== null ? '/' + year : ''
  }
}

module.exports = RemoteResponse
