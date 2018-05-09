const { MigrationInteractorFactory } = require('./migration-interactor-factory')
const { Migrator } = require('./migrator')

/**
 * The dummy driver interface used for testing.
 */
async function createMigrator ({ migrationDir = 'migrations', migrationTable = 'migration' } = {}) {
  const factory = new MigrationInteractorFactory()
  const migrations = await factory.createFromDirectory(migrationDir)
  return new Migrator(migrations, migrationTable)
}

exports.createMigrator = createMigrator
