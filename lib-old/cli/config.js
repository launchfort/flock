const fs = require('fs')
const { promisify } = require('util')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const CONFIG_KEYS = [
  'driver',
  'migrationTable',
  'migrationDir'
]

/**
 * @typedef {Object} Config
 * @prop {string} driver
 * @prop {string} migrationTable
 * @prop {string} migrationDir
 */

/**
 * Duplicates the properties specified in the props array from the specified
 * object into a new object.
 *
 * @arg {Object} obj
 * @arg {string[]} props
 * @return {Object}
 */
function objectFromProps (obj, props, { dest = Object.create(null) } = {}) {
  return props
    .filter(key => key in obj)
    .reduce((o, key) => {
      return Object.assign(o, { [key]: obj[key] })
    }, dest)
}

// Important we set this to undefined so that when calling objectFromProps()
// with this set as the destination object will default properly to a new object.
let cfgInstance

/**
 * Retrieve a singleton instance of the loaded config object.
 *
 * @return {Promise<Config>}
 */
function instance (fileName = '.flockrc.json') {
  if (cfgInstance) {
    return Promise.resolve(cfgInstance)
  } else {
    return load(fileName).then(theCfg => {
      cfgInstance = theCfg
      return cfgInstance
    })
  }
}

/**
 * Loads a config file.
 *
 * @param {string} [fileName] The config file name
 * @return {Promise<Config>}
 */
function load (fileName = '.flockrc.json') {
  return readFile(fileName, { encoding: 'utf8' }).then(json => {
    return JSON.parse(json)
  }).then(cfg => {
    cfgInstance = objectFromProps(cfg, CONFIG_KEYS, { dest: cfgInstance })
    return cfgInstance
  }).catch(error => {
    if (error.code === 'ENOENT') {
      return Object.create(null)
    } else {
      return Promise.reject(error)
    }
  })
}

/**
 * Writes to a config file.
 *
 * @param {Config} cfg The config object
 * @param {string} [fileName] The config file name
 * @return {Promise<Config>}
 */
function write (cfg, fileName = '.flockrc.json') {
  cfgInstance = objectFromProps(cfg, CONFIG_KEYS, { dest: cfgInstance })
  return writeFile(fileName, JSON.stringify(cfgInstance, null, 2), { encoding: 'utf8' }).then(() => cfgInstance)
}

/**
 * Attempts to read an existing .yo-rc.json file and convert it to a .flockrc.json
 * file instead.
 *
 * @return {Promise<Config | false>}
 */
function replaceYoRc (yoRcFileName = '.yo-rc.json', { cfgFileName } = {}) {
  return readFile(yoRcFileName)
    .then(json => {
      return Promise.resolve(JSON.parse(json))
        .then(({ flock = {}, promptValues }) => {
          return flock.promptValues || promptValues || {}
        })
        .then(cfg => {
          return new Promise((resolve, reject) => {
            fs.unlink(yoRcFileName, error => {
              error ? reject(error) : resolve()
            })
          }).then(() => write(cfg, cfgFileName))
        })
    }, error => {
      if (error.code === 'ENOENT') {
        return false
      } else {
        return Promise.reject(error)
      }
    })
}

exports.instance = instance
exports.load = load
exports.write = write
exports.replaceYoRc = replaceYoRc
