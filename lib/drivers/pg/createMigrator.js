const { MigrationInteractorFactory } = require('./migration-interactor-factory')
const { Migrator } = require('./migrator')

/**
 * The driver interface that creates an instance of a Migrator.
 *
 * @param {{ migrationDir: string, migrationTable: string }} [options] The plugin options
 * @return {Promise<Migrator>}
 */
async function createMigrator ({ migrationDir = 'migrations', migrationTable = 'migration' } = {}) {
  const {
    env: {
      PGHOST = 'localhost',
      PGUSER = process.env.USER,
      PGDATABASE = process.env.USER,
      PGPORT = 5432
    }
  } = process
  console.log(`Database connection string (without password) ${PGUSER}://${PGHOST}:${PGPORT}/${PGDATABASE}`)

  const factory = new MigrationInteractorFactory()
  const migrations = await factory.createFromDirectory(migrationDir)
  return new Migrator(migrations, migrationTable)
}

exports.createMigrator = createMigrator
