const { Environment } = require('../../../flock/environment')
const { prompt: basePrompt } = require('../../prompt')

async function prompt ({ answers = {}, cfgFileName } = {}) {
  const questions = [
    {
      type: 'list',
      name: 'migrationType',
      message: 'Choose the type of migration',
      choices: [
        { name: 'Create table', value: 'create-table' },
        { name: 'Alter table', value: 'alter-table' },
        { name: 'Other', value: 'other' }
      ]
    },
    {
      type: 'input',
      name: 'table',
      message: a => {
        return a.migrationType === 'other'
          ? 'What table is being migrated (optional)?'
          : 'What table is being migrated?'
      },
      validate: (table, a) => {
        if (a.migrationType !== 'other' && !table) {
          throw new Error('Please specify the table being migrated')
        } else {
          return true
        }
      }
    },
    {
      type: 'input',
      name: 'migrationName',
      message: 'What is the file name of the migration?',
      default: (a) => {
        const { migrationDir, table, migrationType } = a
        const env = new Environment()
        return env.generateMigrationBasename(migrationType, table, { migrationDir })
      }
    }
  ]

  return basePrompt(questions, { answers, cfgFileName })
}

exports.prompt = prompt
