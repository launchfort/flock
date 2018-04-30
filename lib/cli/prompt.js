const inquirer = require('inquirer')
const config = require('./config')
const { Environment } = require('../flock')

/*
 * Base command line prompts. These prompt answers are saved to the Flock config
 * file .flockrc.json.
 */

async function prompt (questions, { answers = {}, cfgFileName } = {}) {
  const cfg = await config.instance(cfgFileName)
  answers = Object.assign({}, cfg, answers)

  const driverChoices = await getDatabaseDriverChoices(new Environment())
  const bind = fn => a => fn(Object.assign({}, a, answers))
  const bind2 = fn => (input, a) => fn(input, Object.assign({}, a, answers))

  questions = [
    {
      type: 'list',
      name: 'driver',
      message: 'Choose your database driver',
      choices: driverChoices
    },
    {
      type: 'input',
      name: 'migrationTable',
      message: 'What should the migration table name be?',
      default: 'migration'
    },
    {
      type: 'input',
      name: 'migrationDir',
      message: 'What directory should migrations be written to?',
      default: 'migrations'
    }
  ].concat(questions).filter(x => {
    // Filter out questions that already have an answer provided.
    return answers[x.name] === undefined
  }).map(x => {
    // Bind all options that are defined as a function so that the provided
    // answers and the prompted answers are merged and passed to the function.
    return Object.assign({}, x, {
      message: typeof x.message === 'function' ? bind(x.message) : x.message,
      default: typeof x.default === 'function' ? bind(x.default) : x.default,
      choices: typeof x.choices === 'function' ? bind(x.choices) : x.choices,
      when: typeof x.when === 'function' ? bind(x.when) : x.when,
      validate: typeof x.validate === 'function' ? bind2(x.validate) : x.validate,
      transformer: typeof x.transformer === 'function' ? bind2(x.transformer) : x.transformer
    })
  })

  // If we have questions that don't already have an answer provided then we ask
  // them. We do this to avoid the unterminated process bug in Inquirer when
  // there are no questsion to ask (i.e. when resolves to false for each question).
  if (questions.length > 0) {
    const a = await inquirer.prompt(questions)
    answers = Object.assign({}, a, answers)
  }

  await config.write(
    answers,
    cfgFileName
  )

  return answers
}

async function getDatabaseDriverChoices (env) {
  const drivers = await env.enumerateDrivers()
  return drivers.map(x => {
    return {
      value: x.id,
      name: `${x.name}: ${x.description}`
    }
  })
}

exports.prompt = prompt
