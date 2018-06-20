import * as FileSystem from 'fs'
import { writeRc } from '../write-rc'

export async function init ({ rcFileName = 'flockrc.js' } = {}) {
  let migrationDir = 'migrations'
  let migrationTable = 'migration'

  if (FileSystem.existsSync(rcFileName)) {
    return Promise.reject(Object.assign(
      new Error(`Rc file ${rcFileName} already exists`),
      { code: 'RC_FILE_EXISTS' }
    ))
  }

  return writeRc({
    migrationDir,
    migrationTable,
    fileName: rcFileName
  })
}
