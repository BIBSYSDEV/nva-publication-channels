const channelRegistryUri = 'https://api.nsd.no/dbhapitjener/Tabeller/hentJSONTabellData'

const axios = require('axios')

const responseWithBody = (body) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    isBase64Encoded: false,
    body: JSON.stringify(body) || '{}'
  }
}

const performQuery = async request => {
  const nsdResponse = await axios.post(channelRegistryUri, request)
  return responseWithBody(nsdResponse.data)
}

module.exports = { performQuery }
