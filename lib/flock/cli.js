async function cli (migrator, ctx, args) {
  // flock migrate [lastId]
  // flock rollback [lastId]
  // flock latest
  const command = args[0]
  let lastId = (args[1] || '')
  lastId = lastId.startsWith('-') ? null : lastId

  const context = Object.freeze(ctx)
  const t = Date.now()
  let time = 0

  switch (command) {
    case 'migrate':
      await migrator.migrate(context, lastId)
      time = ((Date.now() - t) / 1000).toFixed(3)
      console.log(`Migrations successfully completed in ${time} seconds`)
      return { context, command }
    case 'rollback':
      await migrator.rollback(context, lastId)
      time = ((Date.now() - t) / 1000).toFixed(3)
      console.log(`Migrations successfully rolled back in ${time} seconds`)
      return { context, command }
    case 'latest':
      const id = await migrator.getLatest(context)
      console.log(id)
      return { context, command }
    default:
      throw new Error(`Unknown command "${command}".`)
  }
}

exports.cli = cli
