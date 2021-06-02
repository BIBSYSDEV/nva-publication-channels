class PathDefinitionError extends Error {
  constructor (path) {
    super(`Invalid path definition: ${path}. The path should begin with a slash and be a valid URI segment`)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = PathDefinitionError
