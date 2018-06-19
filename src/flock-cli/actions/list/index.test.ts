import * as Assert from 'assert'
import * as TestHelpers from '../../../test-helpers'
import { list } from './index'

describe('flock-cli/actions/list', function () {
  it('should list all migrations', async function () {
    const mockMigrator = new TestHelpers.MockMigrator([
      { id: 'one', migrated: true, migratedAt: new Date(2018, 0, 1) },
      { id: 'two', migrated: true, migratedAt: new Date(2018, 0, 2) },
      { id: 'three', migrated: false, migratedAt: new Date(2018, 0, 3) },
      { id: 'four', migrated: false, migratedAt: new Date(2018, 0, 4) }
    ])
    const log = TestHelpers.spy()
    await list({
      migrator: mockMigrator,
      log
    })

    Assert.strictEqual(log.calls.length, 1)
    Assert.deepStrictEqual(
      [].concat(...log.calls.map(x => x.args)), [
        'Migrations:', '\n', mockMigrator.migrationState.map(x => {
          return {
            value: x.id,
            name: `${x.migrated ? '✓' : '✗'} ${x.id}`
          }
        })
      ]
    )
  })
})
