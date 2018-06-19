export async function list ({ migrator, log = console.log }) {
  const migrationState = await migrator.getMigrationState()
  const list = migrationState.map(x => ({
    value: x.id,
    name: `${x.migrated ? '✓' : '✗'} ${x.id}`
  }))

  log('Migrations:', '\n', list)
}
