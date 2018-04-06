const { EventDispatcher } = require('./event-dispatcher')

/**
 * @typedef {Object} Connection
 * @prop {{ ():Promise<void> }} disconnect
 * @prop {{ migrationTable:string, [key:string]:any }} context
 */

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
   * @param {string} migrationTable The name of the table where migration execution records are stored
   */
  constructor (migrationInteractors, migrationTable) {
    super()
    this.migrationInteractors = migrationInteractors.slice()
    this.migrationTable = migrationTable
  }

  /**
   * Connects to the DB and creates the new migration context and disconnect function.
   *
   * If the `acquireLock` option is truthy then after connecting an advisory or
   * session lock will attempt to be acquired. If the lock cannot be acquired
   * then an error will be raised.
   *
   * @abstract
   * @param {{ acquireLock?:boolean }} options
   * @return {Promise<Connection>}
   */
  async connect ({ acquireLock = false } = {}) {
    throw new Error('Unimplemented')
  }

  /**
   * @type {string[]}
   */
  get migrationIds () {
    return this.migrationInteractors.map(x => x.id)
  }

  /**
   * Inspect each migration and retrieve its ID and whether or not it has been
   * migrated.
   *
   * @return {Promise<{ id:string, migrated:boolean }[]>}
   */
  async inspectMigrations () {
    const { context, disconnect } = await this.connect()
    try {
      return Promise.all(this.migrationInteractors.map(async (x) => {
        const migrated = await x.hasRun(context)
        return { id: x.id, migrated }
      }))
    } finally {
      await disconnect()
    }
  }

  /**
   * Migrates all migrations up to and including the module referenced by lastId.
   *
   * @param {string} [lastId] The ID of the migration that will be last to be migrated
   * @return {Promise<void>}
   */
  async migrate (lastId = null) {
    const index = lastId
      ? this.migrationInteractors.findIndex(x => x.id === lastId)
      : Infinity

    if (index < 0) {
      throw new Error(`Migration with ID ${lastId} not found.`)
    }

    const { context, disconnect } = await this.connect({ acquireLock: true })
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
    }, Promise.resolve()).then(disconnect, error => {
      return disconnect().then(() => Promise.reject(error))
    })
  }

  /**
   * Retrieves the ID of the last migration to have been migrated.
   *
   * @return {Promise<string>} Resolves to the ID of the mirgration or the empty string
   */
  async getLatest () {
    const { context, disconnect } = await this.connect()
    const migrationInteractors = this.migrationInteractors.slice()

    try {
      while (migrationInteractors.length) {
        const migrationInteractor = migrationInteractors.pop()
        const hasRun = await migrationInteractor.hasRun(context)

        if (hasRun) {
          return migrationInteractor.id
        }
      }
    } finally {
      await disconnect()
    }

    return ''
  }

  /**
   * Rolls back the last migrated migration. If lastId is '@all' then all
   * migrations up to and including the migration referenced by lastId
   * will be rolled back (default).
   *
   * @param {string} [lastId] The ID of the migration that will be last to be rolled back or '@all'
   * @return {Promise<void>}
   */
  async rollback (lastId = null) {
    if (lastId === null) {
      lastId = await this.getLatest()

      // Nothing to actually rollback.
      if (lastId === '') {
        return
      }
    }

    const index = lastId === '@all'
      ? 0
      : this.migrationInteractors.findIndex(x => x.id === lastId)

    if (index < 0) {
      throw new Error(`Migration with ID ${lastId} not found.`)
    }

    const { context, disconnect } = await this.connect({ acquireLock: true })
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
    }, Promise.resolve()).then(disconnect, error => {
      return disconnect().then(() => Promise.reject(error))
    })
  }
}

exports.Migrator = Migrator
