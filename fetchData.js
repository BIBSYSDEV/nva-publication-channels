const axios = require('axios')
const ChannelRegistryUrl = 'https://api.nsd.no/dbhapitjener/Tabeller/hentJSONTabellData'

const fetch = async (request) => {
  console.log('Calling real fetcData, with ' + JSON.stringify(request))
  const response = await axios.post(ChannelRegistryUrl, request)
  console.log('Response=')
  console.log(response)
  return response
}

exports.fetch = fetch
