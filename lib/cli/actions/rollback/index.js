const { Environment } = require('../../../flock/environment')
const { prompt } = require('./prompt')

async function rollback ({ list, migrationId, answers = {}, cfgFileName }) {
  answers = Object.assign({}, answers, { migrationId })
  answers = await prompt({ list, answers, cfgFileName })

  const {
    migrationDir,
    migrationTable,
    driver
  } = answers
  const env = new Environment()
  const migrator = await env.createMigrator(driver, { migrationDir, migrationTable })

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
  let time = 0

  await migrator.rollback(migrationId || answers.migrationId)

  time = ((Date.now() - t) / 1000).toFixed(3)
  console.log(`Migrations successfully rolled back in ${time} seconds`)
  migrator.removeAllEventListeners()
}

exports.rollback = rollback
