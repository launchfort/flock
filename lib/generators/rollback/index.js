const AppGenerator = require('../app')
const fs = require('fs')
const path = require('path')

module.exports = class extends AppGenerator {
  constructor (args, opts) {
    super(args, opts)

    this.argument('migrationId', {
      default: null,
      description: 'The ID of the migration (or @all) that will be last to be rolledback',
      required: false
    })

    this.option('list', {
      default: false,
      description: 'Display list of migrations to pick from',
      required: false
    })
  }

  async prompting () {
    const a = await super.prompting()
    const b = await ((() => {
      return this.prompt({
        type: 'list',
        name: 'migrationId',
        message: 'Choose a migration to migrate down to (inclusive)',
        default: null,
        when: !!this.options.list && !this.options.migrationId,
        choices: this._enumerateMigrationIds()
      })
    })())

    this.prompts = Object.assign({}, a, b)
    return this.prompts
  }

  async rollback () {
    const {
      migrationDir,
      migrationTable,
      driver
    } = this.prompts

    const { createMigrator } = require(driver) || {}

    if (typeof driver === 'function') {
      const migrator = createMigrator({ migrationDir, migrationTable })
      await migrator.rollback(this.options.migrationId || this.prompts.migrationId)
    } else {
      throw new Error(`Database driver ${driver} has no createMigrator function.`)
    }
  }

  _enumerateMigrationIds () {
    const { migrationDir } = this.prompts
    return fs.readdirSync(migrationDir).map(x => {
      return path.basename(x, path.extname(x))
    }).sort()
  }
}
