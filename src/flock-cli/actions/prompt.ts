import * as Inquirer from 'inquirer'

/*
 * Ensures that prompting for questions has answers merged into already provided
 * answers, and removes questions that don't need to be asked (i.e. already
 * have an answer). Ensures that all properties on a question definition that
 * are functions have the all answers up to that point in the questions sequence
 * provided as args (i.e. same as the inquirer API).
 */

export async function prompt<T> (questions: any[], { answers = {} }: { answers?: T } = {}): Promise<T> {
  const bind = fn => a => fn(Object.assign({}, a, answers))
  const bind2 = fn => (input, a) => fn(input, Object.assign({}, a, answers))

  // Strip out keys that are explicitly set to undefined. This can happen if
  // arguments are set to the passed in answers object from the calling context
  // and they have no value.
  answers = Object.keys(answers).reduce((obj, key) => {
    return answers[key] === undefined
      ? obj
      : Object.assign(obj, { [key]: answers[key] })
  }, {})

  questions = questions.filter(x => {
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
    const a = await Inquirer.prompt(questions)
    answers = Object.assign({}, a, answers)
  }

  return <T>answers
}
