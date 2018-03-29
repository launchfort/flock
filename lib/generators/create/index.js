const AppGenerator = require('../app')
const fs = require('fs')
const path = require('path')

module.exports = class extends AppGenerator {
  async prompting () {
    const a = await super.prompting()
    const b = await this.prompt([
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
        message: 'What is the table name?'
      },

      {
        type: 'input',
        name: 'migrationName',
        message: 'What is the file name of the migration?',
        default: (answers) => {
          const timecode = this._formatDate(new Date())
          const n = this._getMigrationsCount(timecode)
          return `${timecode}-${n}-${answers.migrationType}--${answers.table}`
        }
      }
    ])

    this.prompts = Object.assign({}, a, b)
    return this.prompts
  }

  async writing () {
    const { migrationType, migrationName, table, migrationDir, driver } = this.prompts
    const driverDir = driver.endsWith('.js') ? path.basename(driver) : driver
    this.fs.copyTpl(
      this.templatePath(`${driverDir}/templates/${migrationType}.ejs`),
      this.destinationPath(`${migrationDir}/${migrationName}`),
      { table }
    )
  }

  _getMigrationsCount (prefix = null) {
    const { migrationDir } = this.prompts
    return migrationDir && this.fs.exists(migrationDir)
      ? fs.readdirSync(migrationDir).filter(x => {
        return prefix ? x.startsWith(prefix) : true
      }).length
      : 0
  }

  _formatDate (d, format = 'YYYY_MM_DD') {
    return format.replace(/YYYY/g, (_) => {
      return d.getFullYear()
    }).replace(/DD/g, (_) => {
      return this._zeroPad(d.getDate())
    }).replace(/MM/g, (_) => {
      return this._zeroPad(d.getMonth() + 1)
    })
  }

  _zeroPad (n, padding = 1) {
    n = parseFloat(n)
    const x = 10 * padding

    if (n < x) {
      return `0${n}`
    } else {
      return x.toString()
    }
  }
}
