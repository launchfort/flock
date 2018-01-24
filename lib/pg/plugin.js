const { MigrationInteractorFactory, Migrator } = require('./index')

/**
 * The command line plugin interface that creates an instance of a Migrator and
 * the migration context.
 *
 * @param {{ directory: string, tableName: string }} [options] The plugin options
 * @return {Promise<{ migrator: Migrator, context: { tableName: string } }>}
 */
async function plugin ({ directory = './migrations', tableName = 'migrations' } = {}) {
  const factory = new MigrationInteractorFactory()
  const migrations = await factory.createFromDirectory(directory)
  const migrator = new Migrator(migrations)

  return { migrator, context: { tableName } }
}

exports.plugin = plugin
