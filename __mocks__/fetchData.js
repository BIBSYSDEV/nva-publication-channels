const fs = require('fs')

const fetch = async () => {
  let data
  try {
    data = fs.readFileSync('./response.json', 'utf8')
  } catch (err) {
    console.error(err)
  }
  return {
    status: 200,
    data: JSON.parse(data)
  }
}

exports.fetch = fetch
