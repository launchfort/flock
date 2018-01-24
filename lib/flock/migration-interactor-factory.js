const fs = require('fs')
const util = require('util')
const path = require('path')
const readdir = util.promisify(fs.readdir)

class MigrationInteractorFactory {
  create (fileName) {
    throw new Error('Unimplemented')
  }

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
    })
  }
}

exports.MigrationInteractorFactory = MigrationInteractorFactory
