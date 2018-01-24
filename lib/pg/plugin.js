const { MigrationInteractorFactory, Migrator } = require('./index')

async function plugin ({ directory = './migrations', tableName = 'migrations' } = {}) {
  const factory = new MigrationInteractorFactory()
  const migrations = await factory.createFromDirectory(directory)
  const migrator = new Migrator(migrations)

  return { migrator, context: { tableName } }
}

exports.plugin = plugin
