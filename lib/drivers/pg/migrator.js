const { Client } = require('pg')
const flock = require('../../flock')
const { MigrationsTableMigrationInteractor } = require('./migrations-table-migration-interactor')
const { context: createContextMethods } = require('./context')

/**
 * A custom migrator that creates a custom migration context.
 *
 * The context provided by this migrator will have all the properties provided
 * by the plugin interface in addition to the following methods:
 *
 * - tableExists(tableName): Promise<boolean>
 * - columnExists(tableName, columnName): Promise<boolean>
 * - columnDataType(tableName, columnName): Promise<string | null>
 * - inspectColumn(tableName, columnName): Promise<{}>
 *
 * Where `inspectColumn` returns a row from the `information_schema.columns`
 * view.
 */
class Migrator extends flock.Migrator {
  constructor (migrationInteractors, migrationTable) {
    super([
      new MigrationsTableMigrationInteractor()
    ].concat(migrationInteractors), migrationTable)
  }

  /**
   * Connects to the DB and creates the new migration context and disconnect function.
   *
   * If the `acquireLock` option is truthy then after connecting an advisory or
   * session lock will attempt to be acquired. If the lock cannot be acquired
   * then an error will be raised.
   *
   * @param {{ acquireLock?:boolean }} options
   * @return {Promise<{ context: { migrationTable: string, [key: string]: any }, disconnect(): Promise<void> }>}
   */
  async connect ({ acquireLock = false } = {}) {
    const client = new Client()
    await client.connect()
    const LOCK = 'migration'

    if (acquireLock) {
      const advisoryLockResult = await client.query(`SELECT pg_try_advisory_lock(${LOCK})`)
      const locked = advisoryLockResult.rows[0] === true

      if (!locked) {
        throw new Error(`Advisory lock "${LOCK}" could not be acquired.`)
      }
    }

    return Object.freeze({
      async disconnect () {
        if (acquireLock) {
          await client.query(`SELECT pg_advisory_unlock(${LOCK})`).then(() => undefined)
        }

        return client.end()
      },
      context: Object.assign(
        { client, migrationTable: this.migrationTable },
        createContextMethods(client)
      )
    })
  }
}

exports.Migrator = Migrator
