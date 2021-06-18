const RemoteResponse = require('./RemoteResponse')

class RemotePublisherResponse extends RemoteResponse {
  constructor (host, identifier, year, name, website, level, active) {
    super(host, 'Publisher', identifier, year, name, website, level, active)
  }
}

module.exports = RemotePublisherResponse
