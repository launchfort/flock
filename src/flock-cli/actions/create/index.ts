import * as FileSystem from 'fs'
import * as Path from 'path'
import { TemplateProvider } from '../../template-provider'
import { DefaultTemplateRenderer } from './template-renderer'
import { mkdirp } from './mkdirp'
import { prompt, Answers } from './prompt'

interface Options extends Answers {
  migrationDir: string
  templateProvider: TemplateProvider
}

const renderer = new DefaultTemplateRenderer()

export async function create ({ migrationDir, templateProvider, migrationType, migrationName, tableName }: Options) {
  const migrationTypes = Array.isArray(templateProvider.migrationTypes)
    ? templateProvider.migrationTypes.slice()
    : []
  const promptOptions = {
    migrationDir,
    migrationTypes,
    answers: { migrationType, migrationName, tableName }
  }
  const answers = await prompt(promptOptions)
  ;({ migrationType, migrationName, tableName } = answers)

  const templateFileName = await templateProvider.provideFileName(migrationType)
  const outFileName = `${migrationDir}/${migrationName}`
  const str = await renderer.render(templateFileName, { tableName })

  await mkdirp(Path.dirname(outFileName))

  return new Promise((resolve, reject) => {
    FileSystem.writeFile(outFileName, str, { encoding: 'utf8' }, error => {
      error ? reject(error) : resolve()
    })
  })
}
