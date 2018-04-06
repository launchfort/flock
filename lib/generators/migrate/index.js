const { Separator } = require('inquirer')
const AppGenerator = require('../app')

module.exports = class extends AppGenerator {
  constructor (args, opts) {
    super(args, opts)

    this.argument('migrationId', {
      default: null,
      description: 'The ID of the migration that will be last to be migrated',
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

    const {
      migrationDir,
      migrationTable,
      driver
    } = this.prompts
    const migrator = await this.flockEnv.createMigrator(driver, { migrationDir, migrationTable })
    const unmigratedIds = await migrator.getUnmigratedMigrationIds()
    const ids = migrator.migrationIds
    const k = Math.max(0, ids.indexOf(unmigratedIds[0]))
    const choices = [ new Separator('-- Migrated --') ].concat(ids.splice(k, 0, new Separator('-- Unmigrated --')))

    const b = await ((() => {
      return this.prompt({
        type: 'list',
        name: 'migrationId',
        message: 'Choose a migration to migrate up to (inclusive)',
        default: k > 0 ? ids[k] : 0,
        when: !!this.options.list && !this.options.migrationId,
        choices: choices
      })
    })())

    // Make the migrator available for other steps.
    this.migrator = migrator
    this.prompts = Object.assign({}, a, b)
    return this.prompts
  }

  async migrate () {
    const { migrator } = this

    let times = {}
    migrator.addEventListener('migrating', function (event) {
      times[event.migrationId] = Date.now()
      console.log(`Migrate migration ${event.migrationId} started`)
    })
    migrator.addEventListener('migrate', function (event) {
      const duration = ((Date.now() - (times[event.migrationId] || 0)) / 1000).toFixed(2)
      console.log(`Migrate migration ${event.migrationId} finished in ${duration} seconds`)
    })

    const t = Date.now()
    let time = 0

    await migrator.migrate(this.options.migrationId || this.prompts.migrationId)

    time = ((Date.now() - t) / 1000).toFixed(3)
    console.log(`Migrations successfully completed in ${time} seconds`)
    migrator.removeAllEventListeners()
  }
}
