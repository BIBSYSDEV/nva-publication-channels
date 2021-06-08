const RemoteResponse = require('./RemoteResponse')

class RemotePublisherResponse extends RemoteResponse {
  constructor (identifier, year, name, website, level, active) {
    super('Publisher', identifier, year, name, website, level, active)
  }
}

module.exports = RemotePublisherResponse
