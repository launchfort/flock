const flock = require('../../flock')

let migrationTableCache = {

}

exports.migrationTableCache = migrationTableCache

/**
 * A dummy migration interactor used for testing.
 */
class MigrationInteractor extends flock.MigrationInteractor {
  hasRun (context) {
    return Promise.resolve(migrationTableCache[this.id] === true)
  }

  up (context) {
    return super.up(context).then(() => {
      migrationTableCache[this.id] = true
    })
  }

  down (context) {
    return super.down(context).then(() => {
      delete migrationTableCache[this.id]
    })
  }
}

exports.MigrationInteractor = MigrationInteractor
