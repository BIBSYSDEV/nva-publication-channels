const fs = require('fs')
const axios = require('axios')
const channelHost = 'https://kanalregister.hkdir.no'
const csvBulk = '/api/krtabeller/bulk-csv?rptNr='
const channels = {
  journals: `${channelHost}${csvBulk}851`,
  publishers: `${channelHost}${csvBulk}850`
}

const axiosConfig = (uri) => {
  return {
    url: uri,
    method: 'GET',
    responseType: 'blob'
  }
}

Object.keys(channels).forEach(key => {
  axios(axiosConfig(channels[key])).then(response => {
    fs.writeFileSync(`./datafiles/${key}.csv`, response.data)
    console.log(`Successfully downloaded ${key}.csv`)
  })
})
