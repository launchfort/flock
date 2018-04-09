const AppGenerator = require('../app')

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
          return this.flockEnv.generateMigrationBasename(answers.migrationType, answers.table, { migrationDir: a.migrationDir })
        }
      }
    ])

    this.prompts = Object.assign({}, a, b)
    return this.prompts
  }

  async writing () {
    this._loadRequiredModule()
    const { migrationType, migrationName, table, migrationDir, driver } = this.prompts
    const templateFileName = this.flockEnv.getTemplateFileName(migrationType, driver)
    this.fs.copyTpl(
      templateFileName,
      this.destinationPath(`${migrationDir}/${migrationName}`),
      { table }
    )
  }
}
