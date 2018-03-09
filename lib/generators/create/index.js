const AppGenerator = require('../app')
const fs = require('fs')

module.exports = class extends AppGenerator {
  async prompting () {
    const a = await super.prompting()
    const b = await ((() => {
      this.prompt([
        {
          type: 'list',
          name: 'migrationType',
          message: 'Choose the type of migration',
          choices: [
            { name: 'Create table', value: 'create-table' },
            { name: 'Alter table', value: 'alter-table' },
            { name: 'Modify colmns', value: 'modify-columns' },
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
            const n = this._getMigrationsCount() + 1
            return `${timecode}-${n}--${answers.migrationType}--${answers.table}`
          }
        }
      ])
    })())

    this.prompts = Object.assign({}, a, b)
    return this.prompts
  }

  _getMigrationsCount () {
    const { migrationDir } = this.prompts
    return migrationDir && this.fs.exists(migrationDir)
      ? fs.readdirSync(migrationDir).length
      : 0
  }

  _formatDate (d, format = 'YYYYMMDD') {
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
