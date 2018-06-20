import * as FileSystem from 'fs'
import * as Path from 'path'
import { promisify } from 'util'
import { writeRc } from '../write-rc'

const unlink = promisify(FileSystem.unlink)

export async function upgrade ({ yoRcFileName = '.yo-rc.json', cfgFileName = '.flockrc.json', rcFileName = 'flockrc.js' } = {}) {
  let migrationDir = ''
  let migrationTable = ''

  if (!FileSystem.existsSync(rcFileName)) {
    // Upgrade from 2.x to 3.x
    if (FileSystem.existsSync(cfgFileName)) {
      const cfg = require(Path.resolve(cfgFileName))
      migrationDir = cfg.migrationDir || 'migrations'
      migrationTable = cfg.migrationTable || 'migration'
      await unlink(cfgFileName)
    // Upgrade from 1.x to 3.x
    } else if (FileSystem.existsSync(yoRcFileName)) {
      const yorc = require(Path.resolve(yoRcFileName))
      const { flock: { promptValues = {} } } = yorc
      migrationDir = promptValues.migrationDir || 'migrations'
      migrationTable = promptValues.migrationTable || 'migration'
      await unlink(yoRcFileName)
    // Upgrade from 0.x to 3.x (assume project was using flock in the early form)
    } else {
      // Version 0.x had migrationTable set to 'migrations'
      migrationDir = 'migrations'
      migrationTable = 'migrations'
    }
  }

  return writeRc({
    migrationDir,
    migrationTable,
    fileName: rcFileName
  })
}
