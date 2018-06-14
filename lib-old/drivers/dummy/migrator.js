const flock = require('../../flock')

/**
 * A dummy migrator used for testing.
 */
class Migrator extends flock.Migrator {
  isMigrationTableReady (context) {
    return true
  }

  async connect ({ acquireLock = false } = {}) {
    return Promise.resolve(Object.freeze({
      disconnect () {
        return Promise.resolve()
      },
      context: {
        migrationTable: this.migrationTable
      }
    }))
  }
}

exports.Migrator = Migrator
