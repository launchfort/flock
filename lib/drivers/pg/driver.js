const { MigrationInteractorFactory, Migrator } = require('./index')

/**
 * The command line plugin interface that creates an instance of a Migrator.
 *
 * @param {{ migrationDir: string, migrationTable: string }} [options] The plugin options
 * @return {Promise<Migrator>}
 */
async function driver ({ migrationDir = 'migrations', migrationTable = 'migration' } = {}) {
  const factory = new MigrationInteractorFactory()
  const migrations = await factory.createFromDirectory(migrationDir)
  return new Migrator(migrations, migrationTable)
}

exports.driver = driver
