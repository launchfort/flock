import * as Path from 'path'
import { Command } from 'commander'
import * as Flock from '../index'
import * as Actions from './actions'
import { TemplateProvider, DefaultTemplateProvider } from './template-provider'

export { TemplateProvider }

export function run (args) {
  const cmd = init()

  if (args.length > 2) {
    cmd.parse(args)
  } else {
    cmd.help()
  }
}

interface Rc {
  migrator: Flock.Migrator
  migrationDir: string
  templateProvider: TemplateProvider
}

function requireRc (fileName = '.flockrc.js'): Rc {
  let rc: Rc = require(Path.resolve(fileName))
  rc.templateProvider = rc.templateProvider || new DefaultTemplateProvider()
  return rc
}

function init () {
  let cmd = new Command()
  const pkg = require('../../package.json')

  cmd.version(pkg.version, '-v, --version')

  cmd
    .command('init')
    .description('Create the flock project rc file')
    .option('--rc', 'The rc file to write to (default .flockrc.js)')
    .action((cmd) => {
      Actions.init({ rcFileName: cmd.rc }).catch(error => {
        console.error(error)
        process.exit(1)
      })
    })

  cmd
    .command('upgrade')
    .description('Upgrade a flock project')
    .option('-c, --config', 'The flock 2.x config file to read from (default .flockrc.json)')
    .option('--rc', 'The rc file to write to (default .flockrc.js)')
    .action((cmd) => {
      Actions.upgrade({ cfgFileName: cmd.config, rcFileName: cmd.rc }).catch(error => {
        console.error(error)
        process.exit(1)
      })
    })

  cmd
    .command('create')
    .description('Create a database migration')
    .option('-r, --require <moduleId>', 'Module ID of a module to require before creating a migration')
    .option('--rc', 'The rc file to load (default .flockrc.js)')
    .action((cmd) => {
      if (cmd.require) require(cmd.require)
      const { migrationDir, templateProvider } = requireRc(cmd.rc)
      const opts = { migrationDir, templateProvider }
      Actions.create(opts).catch(error => {
        console.error(error)
        process.exit(1)
      })
    })

  cmd
    .command('migrate [migrationId]')
    .description('Run all migrations, or up to a specific migration')
    .option('-l, --list', 'Display list of migrations to pick from')
    .option('-r, --require <moduleId>', 'Module ID of a module to require before migrating')
    .option('--rc', 'The rc file to load (default .flockrc.js)')
    .action((migrationId, cmd) => {
      if (cmd.require) require(cmd.require)
      const { migrator } = requireRc(cmd.rc)
      const opts = {
        showList: !!cmd.list,
        migrationId,
        migrator
      }
      Actions.migrate(opts).catch(error => {
        console.error(error)
        process.exit(1)
      })
    })

  cmd
    .command('rollback [migrationId]')
    .description('Rollback the last ran migration, all migrations, or down to a specific migration')
    .option('-l, --list', 'Display list of migrations to pick from')
    .option('-r, --require <moduleId>', 'Module ID of a module to require before rolling back')
    .option('--rc', 'The rc file to load (default .flockrc.js)')
    .usage('rollback [migrationId | @all]')
    .action((migrationId, cmd) => {
      if (cmd.require) require(cmd.require)
      const { migrator } = requireRc(cmd.rc)
      const opts = {
        showList: !!cmd.list,
        migrationId,
        migrator
      }
      Actions.rollback(opts).catch(error => {
        console.error(error)
        process.exit(1)
      })
    })

  cmd
    .command('list')
    .description('Display list of migrations')
    .option('--rc', 'The rc file to write to (default .flockrc.js)')
    .action((cmd) => {
      const { migrator } = requireRc(cmd.rc)
      const opts = {
        migrator
      }
      Actions.list(opts).catch(error => {
        console.error(error)
        process.exit(1)
      })
    })

  cmd
    .command('*')
    .action(() => cmd.help())

  return cmd
}
