const program = require('commander')
const yeoman = require('yeoman-environment')
const pkg = require('../package.json')

module.exports = function (args) {
  initProgram(initYeomanEnv())

  if (args.length > 2) {
    program.parse(args)
  } else {
    program.help()
  }
}

function initYeomanEnv () {
  const env = yeoman.createEnv()

  env.register(require.resolve('./generators/create'), 'flock:create')
  env.register(require.resolve('./generators/migrate'), 'flock:migrate')
  env.register(require.resolve('./generators/rollback'), 'flock:rollback')

  return env
}

function initProgram (env) {
  program.version(pkg.version, '-v, --version')

  program
    .command('create')
    .description('Create a database migration')
    .option('--require', 'Module ID of a module to require before writing module file')
    .action((...args) => {
      env.run([ 'flock:create' ].concat(args.slice(0, -1)), {})
    })

  program
    .command('migrate [migrationId]')
    .description('Run all migrations, or up to a specific migration')
    .option('--require', 'Module ID of a module to require before migrating')
    .option('--list', 'Display list of migrations to pick from')
    .action((...args) => {
      env.run([ 'flock:migrate' ].concat(args.slice(0, -1)))
    })

  program
    .command('rollback [migrationId]')
    .description('Rollback the last ran migration, all migrations, or down to a specific migration')
    .option('--require', 'Module ID of a module to require before rolling back')
    .option('--list', 'Display list of migrations to pick from')
    .usage('rollback [migrationId | @all]')
    .action((...args) => {
      env.run([ 'flock:rollback' ].concat(args.slice(0, -1)))
    })

  program
    .command('*')
    .action(() => program.help())
}
