import * as Assert from 'assert'
import * as Path from 'path'
import * as FileSystem from 'fs'
import { promisify } from 'util'
import * as TestHelpers from '../../../test-helpers'
import { upgrade } from './index'

const writeFile = promisify(FileSystem.writeFile)
const readFile = promisify(FileSystem.readFile)
const stat = promisify(FileSystem.stat)
const exists = fileName => stat(fileName).then(() => true).catch(error => {
  if (error.code === 'ENOENT') {
    return false
  } else {
    throw error
  }
})

describe('flock-cli/actions/upgrade', function () {
  let dir = null
  beforeEach(async function () {
    dir = await TestHelpers.tmpdir()
  })

  afterEach(function () {
    return dir ? TestHelpers.rmdirp(dir) : null
  })

  it('should upgrade a project that used version 0.x', async function () {
    const rcFileName = Path.join(dir, 'flockrc-.js')

    await upgrade({ rcFileName })

    const rcExists = await exists(rcFileName)
    Assert.ok(rcExists, `${Path.basename(rcFileName)} does not exist`)

    const rcText = await readFile(rcFileName)
    Assert.ok(rcText.indexOf(`const migrationTableName = 'migrations'`) > 0)
    Assert.ok(rcText.indexOf(`const migrationDir = 'migrations'`) > 0)
  })

  it('should upgrade a project that used version 1.x', async function () {
    const rcFileName = Path.join(dir, 'flockrc-.js')
    const yoRcFileName = Path.join(dir, '.yo-rc.json')
    const yoRc = {
      flock: {
        promptValues: {
          driver: 'flock:lib/drivers/pg',
          migrationDir: 'miggrationDir',
          migrationTable: 'migrationTable'
        }
      }
    }

    await writeFile(yoRcFileName, JSON.stringify(yoRc), { encoding: 'utf8' })
    await upgrade({ yoRcFileName, rcFileName })

    const yoRcExists = await exists(yoRcFileName)
    Assert.notEqual(yoRcExists, '.yo-rc.json still exists')

    const rcExists = await exists(rcFileName)
    Assert.ok(rcExists, `${Path.basename(rcFileName)} does not exist`)

    const rcText = await readFile(rcFileName)
    Assert.ok(rcText.indexOf(`const migrationTableName = '${yoRc.flock.promptValues.migrationTable}'`) > 0)
    Assert.ok(rcText.indexOf(`const migrationDir = '${yoRc.flock.promptValues.migrationDir}'`) > 0)
  })

  it('should upgrade a project that used version 2.x', async function () {
    const rcFileName = Path.join(dir, 'flockrc-.js')
    const cfgFileName = Path.join(dir, '.flockrc-.json')
    const cfg = {
      driver: 'flock:lib/drivers/pg',
      migrationDir: 'miggrationDir!!',
      migrationTable: 'migrationTable!!'
    }

    await writeFile(cfgFileName, JSON.stringify(cfg), { encoding: 'utf8' })
    await upgrade({ cfgFileName, rcFileName })

    const cfFileExists = await exists(cfgFileName)
    Assert.notEqual(cfFileExists, `${Path.basename(cfgFileName)} still exists`)

    const rcExists = await exists(rcFileName)
    Assert.ok(rcExists, `${Path.basename(rcFileName)} does not exist`)

    const rcText = await readFile(rcFileName)
    Assert.ok(rcText.indexOf(`const migrationTableName = '${cfg.migrationTable}'`) > 0)
    Assert.ok(rcText.indexOf(`const migrationDir = '${cfg.migrationDir}'`) > 0)
  })

  it('should leave a project that used version 3.x unmodified', async function () {
    const rcFileName = Path.join(dir, 'flockrc-.js')
    const rc = 'Hello World!'

    await writeFile(rcFileName, rc, { encoding: 'utf8' })
    await upgrade({ rcFileName })

    const rcExists = await exists(rcFileName)
    Assert.ok(rcExists, `${Path.basename(rcFileName)} does not exist`)

    const rcText = await readFile(rcFileName)
    Assert.strictEqual(rc, 'Hello World!')
  })
})
