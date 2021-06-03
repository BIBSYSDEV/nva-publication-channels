const VALID_METHODS = require('../routeSpec/Constants')

class MethodDefinitionError extends Error {
  constructor (method) {
    super(`Invalid method definition: ${method}. Valid methods: ${VALID_METHODS.toString()}`)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = MethodDefinitionError
