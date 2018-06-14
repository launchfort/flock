const { MigrationInteractor } = require('./migration-interactor')

/**
 * A migration interactor that will create the migrations table.
 */
class MigrationsTableMigrationInteractor extends MigrationInteractor {
  constructor (migrationTable) {
    super(`create-table--${migrationTable}`)
  }

  hasRun (context) {
    const { migrationTable } = context
    return context.tableExists(migrationTable)
  }

  async up (context) {
    const { migrationTable, client } = context
    const query =
`CREATE TABLE IF NOT EXISTS "${migrationTable}" (
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
    const { migrationTable, client } = context
    const query = `DROP TABLE IF EXISTS "${migrationTable}"`
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
