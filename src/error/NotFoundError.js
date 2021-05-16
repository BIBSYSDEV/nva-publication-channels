'use strict'

class NotFoundError extends Error {
  get name () {
    return this.constructor.name
  }
}

module.exports = NotFoundError
