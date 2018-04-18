const { MigrationInteractorFactory } = require('./migration-interactor-factory')
const { Migrator } = require('./migrator')
const Config = require('./config')

/**
 * The driver interface that creates an instance of a Migrator.
 *
 * @param {{ migrationDir: string, migrationTable: string }} [options] The plugin options
 * @return {Promise<Migrator>}
 */
async function createMigrator ({ migrationDir = 'migrations', migrationTable = 'migration' } = {}) {
  const {
    pgConfig: {
      user,
      host,
      port,
      database
    }
  } = Config
  console.log(`Database connection string (without password) ${user}://${host}:${port}/${database}`)

  const factory = new MigrationInteractorFactory()
  const migrations = await factory.createFromDirectory(migrationDir)
  return new Migrator(migrations, migrationTable)
}

exports.createMigrator = createMigrator
