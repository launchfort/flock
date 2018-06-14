import { prompt as basePrompt } from '../prompt'
import { generateMigrationBasename } from './generate-migration-basename'

export interface Answers {
  migrationType?: 'create-table'|'alter-table'|'other'
  tableName?: string
  migrationName?: string
}

export interface Options {
  migrationTypes: string[]
  migrationDir: string
  answers?: Answers
}

export async function prompt ({ migrationDir, migrationTypes, answers = {} }: Options) {
  const questions = [
    {
      type: 'list',
      name: 'migrationType',
      message: 'Choose the type of migration',
      when: migrationTypes.length > 0,
      default: () => migrationTypes.length > 0 ? '' : 'default',
      choices: migrationTypes.map(x => {
        return {
          // Make name proper case; words separted with '-' are uppercased
          name: x.split('-')
            .filter(Boolean)
            .map(x => x[0].toUpperCase() + x.substr(1))
            .join(' '),
          value: x
        }
      })
    },
    {
      type: 'input',
      name: 'tableName',
      message: 'What table is being migrated?',
      validate: (tableName, a) => {
        if (!tableName) {
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
