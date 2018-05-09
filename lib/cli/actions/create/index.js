const fs = require('fs')
const path = require('path')
const ejs = require('ejs')
const { mkdirp } = require('../../../mkdirp')
const { Environment } = require('../../../flock/environment')
const { prompt } = require('./prompt')

function renderTemplate (templateFileName, context = {}) {
  return new Promise((resolve, reject) => {
    ejs.renderFile(templateFileName, context, (error, str) => {
      error ? reject(error) : resolve(str)
    })
  })
}

async function create ({ answers = {}, cfgFileName } = {}) {
  const env = new Environment()
  answers = await prompt({ answers, cfgFileName })
  const { driver, migrationDir, migrationType, migrationName, table } = answers
  const templateFileName = env.getTemplateFileName(migrationType, driver)
  const outFileName = `${migrationDir}/${migrationName}`
  const str = await renderTemplate(templateFileName, { table })

  await mkdirp(path.dirname(outFileName))

  return new Promise((resolve, reject) => {
    fs.writeFile(outFileName, str, { encoding: 'utf8' }, error => {
      error ? reject(error) : resolve()
    })
  })
}

exports.create = create
