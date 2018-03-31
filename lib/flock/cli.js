/**
 * Using command line arguments, will interface with a migrator to perform
 * migrations.
 *
 * Command Line:
 * {command} [lastId]
 *
 * Where {command} is one of the following:
 *
 * migrate
 * rollback
 * latest
 *
 * The 'migrate' and 'rollback' commands optionally accept a second argument
 * that will be passed as the lastId argument to migrate() and rollback()
 * respectively.
 *
 * @deprecated
 * @param {Migrator} migrator The Migrator instance
 * @param {Object} ctx The migration context
 * @param {string[]} args Command line arguments
 * @return {Promise}
 */
async function cli (migrator, ctx, args) {
  // flock migrate [lastId]
  // flock rollback [lastId]
  // flock latest
  const command = args[0]
  let lastId = args[1] || null
  lastId = lastId ? (lastId.startsWith('-') ? null : lastId) : lastId
  const context = Object.freeze(ctx)

  // Used to calculate how long a migration/rollback take to execute.
  let times = {}

  migrator.addEventListener('migrating', function (event) {
    times[event.migrationId] = Date.now()
    console.log(`Migrate migration ${event.migrationId} started`)
  })
  migrator.addEventListener('rollbacking', function (event) {
    times[event.migrationId] = Date.now()
    console.log(`Rollback migration ${event.migrationId} started`)
  })
  migrator.addEventListener('migrate', function (event) {
    const duration = ((Date.now() - (times[event.migrationId] || 0)) / 1000).toFixed(2)
    console.log(`Migrate migration ${event.migrationId} finished in ${duration} seconds`)
  })
  migrator.addEventListener('rollback', function (event) {
    const duration = ((Date.now() - (times[event.migrationId] || 0)) / 1000).toFixed(2)
    console.log(`Rollback migration ${event.migrationId} finished in ${duration} seconds`)
  })

  const t = Date.now()
  let time = 0

  switch (command) {
    case 'migrate':
      await migrator.migrate(context, lastId)
      time = ((Date.now() - t) / 1000).toFixed(3)
      console.log(`Migrations successfully completed in ${time} seconds`)
      migrator.removeAllEventListeners()
      return { context, command }
    case 'rollback':
      lastId = lastId || '@latest'
      await migrator.rollback(context, lastId === '@all' ? null : lastId)
      time = ((Date.now() - t) / 1000).toFixed(3)
      console.log(`Migrations successfully rolled back in ${time} seconds`)
      migrator.removeAllEventListeners()
      return { context, command }
    case 'latest':
      const id = await migrator.getLatest(context)
      console.log(id)
      migrator.removeAllEventListeners()
      return { context, command }
    default:
      migrator.removeAllEventListeners()
      throw new Error(`Unknown command "${command}".`)
  }
}

exports.cli = cli
