import { prompt as basePrompt } from '../prompt'

export interface Answers {
  migrationId?: string
}

export interface Options {
  showList: boolean
  migrator: any
  answers?: Answers
}

export async function prompt ({ showList, migrator, answers = {} }: Options) {
  return basePrompt<Answers>([
    showList ? {
      type: 'list',
      name: 'migrationId',
      message: 'Choose a migration to migrate up to (inclusive)',
      default: async () => {
        const migrationState = await migrator.getMigrationState()
        return (migrationState.slice(-1).pop() || {}).id
      },
      choices: async () => {
        const migrationState = await migrator.getMigrationState()
        const choices = migrationState.map(x => ({
          value: x.id,
          name: `${x.migrated ? '✓' : '✗'} ${x.id}`
        }))

        return choices
      }
    } : null
  ].filter(Boolean), { answers })
}
