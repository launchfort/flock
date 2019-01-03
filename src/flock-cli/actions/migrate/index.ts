import * as Flock from '../../../index'
import { prompt, Answers } from './prompt'

interface Options extends Answers {
  showList: boolean
  migrator: Flock.Migrator
}

export async function migrate ({ showList, migrationId, migrator }: Options) {
  const answers = await prompt({ showList, migrator, answers: { migrationId } })

  let times = {}
  migrator.on('migrating', function (event) {
    times[event.migrationId] = Date.now()
    console.log(`Migrate migration ${event.migrationId} started`)
  })
  migrator.on('migrate', function (event) {
    const duration = ((Date.now() - (times[event.migrationId] || 0)) / 1000).toFixed(2)
    console.log(`Migrate migration ${event.migrationId} finished in ${duration} seconds`)
  })

  const t = Date.now()
  await migrator.migrate(answers.migrationId)
  migrator.removeAllListeners()
  const time = ((Date.now() - t) / 1000).toFixed(3)
  console.log(`Migrations successfully completed in ${time} seconds`)
}
