const { EventDispatcher } = require('./event-dispatcher')

/**
 * A class to control running migrations.
 *
 * Events:
 *
 * - `migrating` - Dispatched just before a migration starts
 * - `migrate` - Dispatched just after a migration finishes
 * - `rollbacking` - Dispatched just before a migration rollback starts
 * - `rollback` - Dispatched just after a migration rollback finishes
 *
 * The event object has the following shape
 * ```
 * { migrationId: string }
 * ```
 *
 * None of the events can be prevented.
 */
class Migrator extends EventDispatcher {
  /**
   * Constructs a new migrator instance with the specified migration interactors.
   * The order of the migration interactors is kept as-is.
   *
   * @param {MigrationInteractor[]} migrationInteractors The migration interactors
   */
  constructor (migrationInteractors) {
    super()
    this.migrationInteractors = migrationInteractors.slice()
  }

  /**
   * Migrates all migrations up to and including the module referenced by lastId.
   *
   * @param {Object} context The migration context
   * @param {string} [lastId] The ID of the migration that will be last to be migrated
   * @return {Promise}
   */
  migrate (context, lastId = null) {
    const index = lastId
      ? this.migrationInteractors.findIndex(x => x.id === lastId)
      : Infinity

    if (index < 0) {
      throw new Error(`Migration with ID ${lastId} not found.`)
    }

    const migrationInteractors = this.migrationInteractors.slice(0, index + 1)

    return migrationInteractors.reduce((promise, migrationInteractor) => {
      return promise.then(async () => {
        const hasRun = await migrationInteractor.hasRun(context)
        if (!hasRun) {
          this.dispatch({ type: 'migrating', migrationId: migrationInteractor.id })
          return new Promise(resolve => resolve(migrationInteractor.up(context))).then(() => {
            this.dispatch({ type: 'migrate', migrationId: migrationInteractor.id })
          })
        }
      })
    }, Promise.resolve())
  }

  /**
   * Retrieves the ID of the last migration to have been migrated.
   *
   * @param {Object} context The migration context
   * @return {Promise<string>} Resolves to the ID of the mirgration or the empty string
   */
  async getLatest (context) {
    const migrationInteractors = this.migrationInteractors.slice()

    while (migrationInteractors.length) {
      const migrationInteractor = migrationInteractors.pop()
      const hasRun = await migrationInteractor.hasRun(context)

      if (hasRun) {
        return migrationInteractor.id
      }
    }

    return ''
  }

  /**
   * Rolls back all migrations up to and including the module referenced by lastId.
   * If lastId is '@latest' then only the last migrated migration will be rolled back (default).
   *
   * @param {Object} context The migration context
   * @param {string} [lastId] The ID of the migration that will be last to be rolled back
   */
  async rollback (context, lastId = '@latest') {
    if (lastId === '@latest') {
      lastId = await this.getLatest(context)

      // Nothing to actually rollback.
      if (lastId === '') {
        return
      }
    }

    const index = lastId
      ? this.migrationInteractors.findIndex(x => x.id === lastId)
      : 0

    if (index < 0) {
      throw new Error(`Migration with ID ${lastId} not found.`)
    }

    const migrationInteractors = this.migrationInteractors.slice(index).reverse()

    return migrationInteractors.reduce((p, migrationInteractor) => {
      return p.then(async () => {
        const hasRun = await migrationInteractor.hasRun(context)
        if (hasRun) {
          this.dispatch({ type: 'rollbacking', migrationId: migrationInteractor.id })
          return new Promise(resolve => resolve(migrationInteractor.down(context))).then(() => {
            this.dispatch({ type: 'rollback', migrationId: migrationInteractor.id })
          })
        }
      })
    }, Promise.resolve())
  }
}

exports.Migrator = Migrator
