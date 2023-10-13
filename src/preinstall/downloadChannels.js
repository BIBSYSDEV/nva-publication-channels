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

if (!fs.existsSync('./datafiles')) {
  fs.mkdirSync('./datafiles')
}

if (!fs.existsSync('./datafiles/journals')) {
  fs.mkdirSync('./datafiles/journals')
}

if (!fs.existsSync('./datafiles/journals/identifier')) {
  fs.mkdirSync('./datafiles/journals/identifier')
}

if (!fs.existsSync('./datafiles/publishers')) {
  fs.mkdirSync('./datafiles/publishers')
}

if (!fs.existsSync('./datafiles/publishers/identifier')) {
  fs.mkdirSync('./datafiles/publishers/identifier')
}

const persistRawCsv = (type, data) => {
  const file = fs.createWriteStream(`./datafiles/${type}.csv`, { encoding: 'utf-8' })
  file.write(data)
  file.close()
}

const createIdentifierMappings = (type, data) => {
  const getIdentifierFromLine = line => line.split(/,/)[0]

  const appendFileMapping = (filename, batch) => {
    const first = getIdentifierFromLine(batch[1], 0).replaceAll('"', '')
    const last = getIdentifierFromLine(batch[batch.length - 1], 0).replaceAll('"', '')
    mappings.push({ filename: filename, start: first, last: last })
  }

  const writeIdentifierMappings = mappings => {
    const file = fs.createWriteStream(`./datafiles/${type}/identifier/file_mappings.json`)
    const data = JSON.stringify(mappings)
    file.write(data)
    file.end()
    console.log(`Wrote identifiers for ${type}`)
  }

  const write = (filename, batch) => {
    const file = fs.createWriteStream(filename)
    batch.forEach(line => file.write(line + '\n'))
    file.end()
  }
  persistRawCsv(type, data)

  const lines = data.split(/\n/)
  let fileIncrement = 0
  let batchCount = 0
  const mappings = []
  const headers = extractHeaders(lines)
  let batch = []
  for (let i = 0; i < lines.length; i++) {
    if (batchCount === 0) {
      batch.push(headers)
      batch.push(lines[i])
      batchCount = batchCount + 1
    } else if (batchCount < 100 && i < lines.length - 2) {
      batchCount = batchCount + 1
      batch.push(lines[i])
    } else {
      batchCount = 0
      fileIncrement = fileIncrement + 1
      batch.push(lines[i])
      const filename = `./datafiles/${type}/identifier/file_${fileIncrement}.csv`
      appendFileMapping(filename, batch)
      write(filename, batch)
      batch = []
    }
  }
  writeIdentifierMappings(mappings)
}

const extractHeaders = lines => {
  const headers = lines[0]
  lines.splice(0, 1)
  return headers
}

Object.keys(channels).forEach(key => {
  axios(axiosConfig(channels[key])).then(response => {
    createIdentifierMappings(key, response.data)
  })
})
