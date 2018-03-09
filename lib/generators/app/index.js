const Generator = require('yeoman-generator')
const fs = require('fs')
const path = require('path')

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

    this.prompts = await this.prompt([
      {
        type: 'list',
        name: 'driver',
        message: 'Choose your database driver',
        choices: this._getDatabaseDriverChoices(),
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

  async writing () {
    await this.prompting()
  }

  _getDatabaseDriverChoices () {
    return [].concat(
      // Enumerate installed database driver modules
      this._enumerateDriverModules(path.resolve('node_modules')),
      // Enumerate builtin database driver modules
      this._enumerateDriverModules(path.resolve(__dirname, '../../drivers'))
    ).map(x => {
      return {
        value: x.id,
        name: `${x.name}: ${x.description}`
      }
    })
  }

  _enumerateDriverModules (dir) {
    try {
      return fs.readdirSync(dir).map(x => {
        try {
          x = path.join(dir, x)
          const pkg = require(path.join(x, 'package.json'))
          const kw = [].concat(pkg.keywords).filter(Boolean)
          const o = {
            name: pkg.name,
            description: pkg.description,
            id: require.resolve(x)
          }
          return kw.includes('flock-driver') ? o : null
        } catch (_) {
          return null
        }
      }).filter(Boolean)
    } catch (_) {
      return []
    }
  }
}
