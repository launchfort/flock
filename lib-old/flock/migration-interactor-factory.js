const fs = require('fs')
const util = require('util')
const path = require('path')
const readdir = util.promisify(fs.readdir)

/**
 * A factory class that makes it easy to create migration interactors.
 */
class MigrationInteractorFactory {
  /**
   * Instantiates an instance of MigrationInteractor.
   *
   * @abstract
   * @param {string} fileName The absolute file name to a Node module
   * @return {MigrationInteractor} The migration interactor
   */
  create (fileName) {
    throw new Error('Unimplemented')
  }

  /**
   * Scans a directory for Node modules and instantiates a MigrationInteractor
   * instance for each.
   *
   * @param {strgin} dir The directory to scan for Node modules
   * @return {[]MigrationInteractor} The instantiated migration interactors
   */
  async createFromDirectory (dir) {
    const files = await this.listFiles(dir)
    return files.sort((a, b) => {
      return a.localeCompare(b)
    }).map(fileName => {
      return this.create(fileName)
    })
  }

  listFiles (dir) {
    return readdir(dir).then(files => {
      return files.map(file => path.resolve(dir, file))
    }).catch(() => [])
  }
}

exports.MigrationInteractorFactory = MigrationInteractorFactory
