import * as FileSystem from 'fs'
import * as Path from 'path'
import * as Ejs from 'ejs'
import { mkdirp } from './mkdirp'
import { prompt, Answers } from './prompt'

interface Options extends Answers {
  migrationDir: string
}

export async function create ({ migrationDir, migrationType, migrationName, tableName }: Options) {
  const answers = await prompt({ migrationDir, answers: { migrationType, migrationName, tableName } })
  ;({ migrationType, migrationName, tableName } = answers)
  const templateFileName = getTemplateFileName(migrationType)
  const outFileName = `${migrationDir}/${migrationName}`
  const str = await renderTemplate(templateFileName, { tableName })

  await mkdirp(Path.dirname(outFileName))

  return new Promise((resolve, reject) => {
    FileSystem.writeFile(outFileName, str, { encoding: 'utf8' }, error => {
      error ? reject(error) : resolve()
    })
  })
}

function renderTemplate (templateFileName, context = {}) {
  return new Promise((resolve, reject) => {
    Ejs.renderFile(templateFileName, context, (error, str) => {
      error ? reject(error) : resolve(str)
    })
  })
}

function getTemplateFileName (migrationType: string) {
  const fileName = Path.join(__dirname, '../../templates', migrationType + '.ejs')
  if (FileSystem.existsSync(fileName)) {
    return fileName
  } else {
    throw new Error(`Template not found [${fileName}]`)
  }
}
