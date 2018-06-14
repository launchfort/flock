import { prompt, Answers } from './prompt'

interface Options extends Answers {
  showList: boolean
  migrator: any
}

export async function migrate ({ showList, migrationId, migrator }: Options) {
  const answers = await prompt({ showList, migrator, answers: { migrationId } })

  let times = {}
  migrator.addEventListener('migrating', function (event) {
    times[event.migrationId] = Date.now()
    console.log(`Migrate migration ${event.migrationId} started`)
  })
  migrator.addEventListener('migrate', function (event) {
    const duration = ((Date.now() - (times[event.migrationId] || 0)) / 1000).toFixed(2)
    console.log(`Migrate migration ${event.migrationId} finished in ${duration} seconds`)
  })

  const t = Date.now()
  const time = ((Date.now() - t) / 1000).toFixed(3)
  await migrator.migrate(answers.migrationId)
  console.log(`Migrations successfully completed in ${time} seconds`)
  migrator.removeAllEventListeners()
}
