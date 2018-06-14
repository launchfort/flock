const { Environment } = require('../../../flock/environment')
const { prompt: basePrompt } = require('../../prompt')

async function prompt ({ list, answers = {}, cfgFileName }) {
  return basePrompt([
    list ? {
      type: 'list',
      name: 'migrationId',
      message: 'Choose a migration to migrate down to (inclusive)',
      default: async (a) => {
        const {
          migrationDir,
          migrationTable,
          driver
        } = a
        const env = new Environment()
        const migrator = await env.createMigrator(driver, { migrationDir, migrationTable })
        const inpsectionResult = await migrator.inspectMigrations()

        return (inpsectionResult.filter(x => x.migrated) || {}).id
      },
      choices: async (a) => {
        const {
          migrationDir,
          migrationTable,
          driver
        } = a
        const env = new Environment()
        const migrator = await env.createMigrator(driver, { migrationDir, migrationTable })
        const inpsectionResult = await migrator.inspectMigrations()
        const choices = inpsectionResult.map(x => ({
          value: x.id,
          name: `${x.migrated ? '✓' : '✗'} ${x.id}`
        }))

        return choices
      }
    } : null
  ].filter(Boolean), { answers, cfgFileName })
}

exports.prompt = prompt
