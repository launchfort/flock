import { prompt, Answers } from './prompt'

interface Options extends Answers {
  showList: boolean
  migrator: any
}

export async function rollback ({ showList, migrationId, migrator }: Options) {
  const answers = await prompt({ showList, migrator, answers: { migrationId } })

  let times = {}
  migrator.addEventListener('rollbacking', function (event) {
    times[event.migrationId] = Date.now()
    console.log(`Rollback migration ${event.migrationId} started`)
  })
  migrator.addEventListener('rollback', function (event) {
    const duration = ((Date.now() - (times[event.migrationId] || 0)) / 1000).toFixed(2)
    console.log(`Rollback migration ${event.migrationId} finished in ${duration} seconds`)
  })

  const t = Date.now()
  const time = ((Date.now() - t) / 1000).toFixed(3)
  await migrator.rollback(answers.migrationId)
  console.log(`Migrations successfully rolled back in ${time} seconds`)
  migrator.removeAllEventListeners()
}
