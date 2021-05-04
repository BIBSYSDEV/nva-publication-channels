const fs = require('fs')

const fetch = async (request) => {
  console.log('Calling MOCK')
  let data
  try {
    data = fs.readFileSync('response.json', 'utf8')
    // console.log(data);
  } catch (err) {
    console.error(err)
  }
  return {
    status: 200,
    data: data
  }
}

exports.fetch = fetch
