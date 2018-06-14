import { prompt as basePrompt } from '../prompt'
import { generateMigrationBasename } from './generate-migration-basename'

export interface Answers {
  migrationType?: 'create-table'|'alter-table'|'other'
  tableName?: string
  migrationName?: string
}

export interface Options {
  migrationDir: string
  answers?: Answers
}

export async function prompt ({ migrationDir, answers = {} }: Options) {
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
      name: 'tableName',
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
        const { tableName, migrationType } = a
        return generateMigrationBasename(migrationType, tableName, { migrationDir })
      }
    }
  ]

  return basePrompt<Answers>(questions, { answers })
}
