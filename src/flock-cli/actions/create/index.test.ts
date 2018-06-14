import * as assert from 'assert'
import * as Path from 'path'
import * as FileSystem from 'fs'
import * as TestHelpers from 'test-helpers'
import { create } from './index'

describe('flock-cli/actions/create', function () {
  let dir = null

  beforeEach(async function () {
    dir = await TestHelpers.tmpdir()
  })

  afterEach(function () {
    return dir ? TestHelpers.rmdirp(dir) : null
  })

  it('should create a migration file', async function () {
    await create({
      migrationDir: dir,
      templateProvider: {
        migrationTypes: [ '-' ],
        provideFileName (migrationType: string) {
          return Promise.resolve(Path.resolve(__dirname, '../../templates/default.ejs'))
        }
      },
      migrationType: '-',
      tableName: '-',
      migrationName: 'create-something.js'
    })

    assert.ok(FileSystem.existsSync(Path.join(dir, 'create-something.js')), 'Migration file was not created')
  })
})
