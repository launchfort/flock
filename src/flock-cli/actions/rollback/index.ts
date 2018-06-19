import * as Flock from '../../../index'
import { prompt, Answers } from './prompt'

interface Options extends Answers {
  showList: boolean
  migrator: Flock.Migrator
}

export async function rollback ({ showList, migrationId, migrator }: Options) {
  const answers = await prompt({ showList, migrator, answers: { migrationId } })

  let times = {}
  migrator.on('rollbacking', function ({ migrationId }) {
    times[migrationId] = Date.now()
    console.log(`Rollback migration ${migrationId} started`)
  })
  migrator.on('rollback', function ({ migrationId }) {
    const duration = ((Date.now() - (times[migrationId] || 0)) / 1000).toFixed(2)
    console.log(`Rollback migration ${migrationId} finished in ${duration} seconds`)
  })

  const t = Date.now()
  const time = ((Date.now() - t) / 1000).toFixed(3)
  await migrator.rollback(answers.migrationId)
  migrator.removeAllListeners()
  console.log(`Migrations successfully rolled back in ${time} seconds`)
}
