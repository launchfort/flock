const fs = require('fs')
const { promisify } = require('util')

const readFile = promisify(fs.readFile)

/**
 * Parses text for environment variables and saves them to an object as keys.
 *
 * Empty lines and lines starting with `#` are skipped.
 *
 * Example format:
 *
 * ```
 *  SOME_KEY=VALUE
 *  OTHER_KEY = VALUE
 *
 *  # Comment
 *  KEY = VALUE
 * ```
 *
 * @param {string} text The text to parse
 * @return {{}} A frozen object containing environment variables as keys
 */
function parseEnvText (text) {
  const lines = text.trim().split(/\r\n|\n/)
  const pairs = lines
    .map(x => x.trim())
    // Skip empty lines and lines starting with '#'
    .filter(x => !!x && !x.startsWith('#'))
    .map(x => x.split('=').map(y => y.trim()))
  const env = pairs.reduce((obj, [key, value]) => {
    obj[key] = value
    return obj
  }, {})

  return Object.freeze(env)
}

/**
 * Asynchronously loads and parses a text file containing environment variables.
 *
 * Empty lines and lines starting with `#` are skipped.
 *
 * Example format:
 *
 * ```
 *  SOME_KEY=VALUE
 *  OTHER_KEY = VALUE
 *
 *  # Comment
 *  KEY = VALUE
 * ```
 *
 * @param {string} fileName The text file to load and parse
 * @return {Promise<{}>} A frozen object whith environment variables as keys
 */
function loadEnvFile (fileName = './.env') {
  return readFile(fileName, 'utf8').then(parseEnvText, error => {
    // Ignore file not found errors.
    if (error.code !== 'ENOENT') {
      return Promise.reject(error)
    }
  })
}

/**
 * Synchronously loads and parses a text file containing environment variables.
 *
 * Empty lines and lines starting with `#` are skipped.
 *
 * Example format:
 *
 * ```
 *  SOME_KEY=VALUE
 *  OTHER_KEY = VALUE
 *
 *  # Comment
 *  KEY = VALUE
 * ```
 *
 * @param {string} fileName The text file to load and parse
 * @return {{}} A frozen object whith environment variables as keys
 */
function loadEnvFileSync (fileName = './.env') {
  try {
    const text = fs.readFileSync(fileName, 'utf8')
    return parseEnvText(text)
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
  }
}

/**
 * Applies an environment variable object to a destination environment variable
 * object. Any variables present on the destination will not be overridden.
 *
 * @param {Object} src The source environment variables object.
 * @param {Object} [dest] The destination environment variables object. Defaults to process.env.
 * @return {Object} The destination environment variables object.
 */
function applyEnv (src, dest = process.env) {
  return Object.assign(dest, Object.assign({}, src, dest))
}

exports.parseEnvText = parseEnvText
exports.loadEnvFile = loadEnvFile
exports.loadEnvFileSync = loadEnvFileSync
exports.applyEnv = applyEnv
