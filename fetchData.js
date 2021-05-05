const axios = require('axios')
const ChannelRegistryUrl = 'https://api.nsd.no/dbhapitjener/Tabeller/hentJSONTabellData'

const fetch = async (request) => {
  console.log('fetcData, with request=' + JSON.stringify(request))
  const response = await axios.post(ChannelRegistryUrl, request)
  return response
}

exports.fetch = fetch
