const fs = require('fs')
const { promisify } = require('util')
const { replaceYoRc, write } = require('../../config')

const stat = promisify(fs.stat)

function upgrade ({ yoRcFileName = '.yo-rc.json', cfgFileName = '.flockrc.json' } = {}) {
  return stat(cfgFileName).catch(error => {
    if (error.code === 'ENOENT') {
      // Attempt to upgrade from 1.x
      return replaceYoRc(yoRcFileName, { cfgFileName })
        .then(cfg => {
          // If we coulnd't upgrade from 1.x then assume the project was using
          // flock 0.x
          if (cfg === false) {
            return write({
              driver: 'flock:lib/drivers/pg',
              migrationDir: 'migrations',
              migrationTable: 'migrations'
            }, cfgFileName)
          }
        })
    } else {
      throw error
    }
  }).then(() => {
    // The project is already using a .flockrc.json file
  })
}

exports.upgrade = upgrade
