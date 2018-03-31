const Generator = require('yeoman-generator')
const { Environment } = require('../../flock')

/**
 * @typedef {Object} StoredPromptValues
 * @prop {string?} driver The module ID for the flock database driver
 * @prop {string?} migrationDir The directory where migration files are stored
 * @prop {string?} migrationTable The name of the migration table
 */

/*
This is the base generator. It's only intended to be used as a base class.
*/

module.exports = exports = class extends Generator {
  constructor (args, opts) {
    super(args, opts)
    this.flockEnv = new Environment()
    this.prompts = {}
  }

  /**
   * @type {StoredPromptValues}
   */
  get storedPromptValues () {
    return this.config.get('promptValuse') || {}
  }

  async prompting () {
    const {
      driver,
      migrationTable,
      migrationDir
    } = this.storedPromptValues

    const driverChoices = await this._getDatabaseDriverChoices()

    this.prompts = await this.prompt([
      {
        type: 'list',
        name: 'driver',
        message: 'Choose your database driver',
        choices: driverChoices,
        store: true,
        when: !driver
      },

      {
        type: 'input',
        name: 'migrationTable',
        message: 'What should the migration table name be?',
        default: 'migration',
        store: true,
        when: !migrationTable
      },

      {
        type: 'input',
        name: 'migrationDir',
        message: 'Where should migrations be created?',
        default: 'migrations',
        store: true,
        when: !migrationDir
      }
    ])

    return this.prompts
  }

  async _getDatabaseDriverChoices () {
    const drivers = await this.flockEnv.enumerateDrivers()
    return drivers.map(x => {
      return {
        value: x.id,
        name: `${x.name}: ${x.description}`
      }
    })
  }
}
