const { MigrationInteractor } = require('./migration-interactor')

/**
 * A migration interactor that will create the migrations table.
 */
class MigrationsTableMigrationInteractor extends MigrationInteractor {
  constructor () {
    super('migrations table')
  }

  hasRun (context) {
    const { tableName } = context
    return context.tableExists(tableName)
  }

  async up (context) {
    const { tableName, client } = context
    const query =
`CREATE TABLE IF NOT EXISTS "${tableName}" (
  id varchar(512),
  created_at timestamp DEFAULT current_timestamp,
  PRIMARY KEY(id)
)`
    await client.query('BEGIN')

    try {
      await client.query(query)
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      return Promise.reject(error)
    }
  }

  async down (context) {
    const { tableName, client } = context
    const query = `DROP TABLE IF EXISTS "${tableName}"`
    await client.query('BEGIN')

    try {
      await client.query(query)
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      return Promise.reject(error)
    }
  }
}

exports.MigrationsTableMigrationInteractor = MigrationsTableMigrationInteractor
