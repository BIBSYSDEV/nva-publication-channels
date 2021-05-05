'use strict'

const { fetch } = require('./fetchData')

const searchHandler = async () => {
  try {
    return await fetch()
  } catch (err) {
    console.log('UPS Error!!!')
    console.log(err)
    return err
  }
}

exports.searchHandler = searchHandler
