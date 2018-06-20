import * as Assert from 'assert'
import * as Path from 'path'
import * as FileSystem from 'fs'
import { promisify } from 'util'
import * as TestHelpers from '../../../test-helpers'
import { init } from './index'

const readFile = promisify(FileSystem.readFile)
const stat = promisify(FileSystem.stat)
const exists = fileName => stat(fileName).then(() => true).catch(error => {
  if (error.code === 'ENOENT') {
    return false
  } else {
    throw error
  }
})

describe('flock-cli/actions/init', function () {
  let dir = null
  beforeEach(async function () {
    dir = await TestHelpers.tmpdir()
  })

  afterEach(function () {
    return dir ? TestHelpers.rmdirp(dir) : null
  })

  it('should create an rc file', async function () {
    const rcFileName = Path.join(dir, 'flockrc-.js')

    await init({ rcFileName })

    const rcExists = await exists(rcFileName)
    Assert.ok(rcExists, `${Path.basename(rcFileName)} does not exist`)

    const rcText = await readFile(rcFileName)
    Assert.ok(rcText.indexOf(`const migrationTableName = 'migration'`) > 0)
    Assert.ok(rcText.indexOf(`const migrationDir = 'migrations'`) > 0)
  })

  it('should reject if an rc file already exists', async function () {
    const rcFileName = Path.join(dir, 'flockrc-.js')
    await TestHelpers.touch(rcFileName)

    Assert.ok(FileSystem.existsSync(rcFileName), 'Rc file does not exist (not touched)')

    try {
      await init({ rcFileName })
      throw new Error('Should reject if rc file exists')
    } catch (error) {
      Assert.strictEqual(error.code, 'RC_FILE_EXISTS')
    }
  })
})
