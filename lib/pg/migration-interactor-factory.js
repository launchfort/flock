const path = require('path')
const flock = require('../flock')
const { MigrationInteractor } = require('./migration-interactor')

class MigrationInteractorFactory extends flock.MigrationInteractorFactory {
  create (fileName) {
    const id = path.basename(fileName, path.extname(fileName))
    const proxy = require(fileName)
    return new MigrationInteractor(id, proxy)
  }
}

exports.MigrationInteractorFactory = MigrationInteractorFactory
