const { MigrationInteractorFactory } = require('./migration-interactor-factory')
const { Migrator } = require('./migrator')

/**
 * The driver interface that creates an instance of a Migrator.
 *
 * @param {{ migrationDir: string, migrationTable: string }} [options] The plugin options
 * @return {Promise<Migrator>}
 */
async function createMigrator ({ migrationDir = 'migrations', migrationTable = 'migration' } = {}) {
  const factory = new MigrationInteractorFactory()
  const migrations = await factory.createFromDirectory(migrationDir)
  return new Migrator(migrations, migrationTable)
}

exports.createMigrator = createMigrator
