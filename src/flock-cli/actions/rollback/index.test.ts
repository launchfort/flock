import * as Assert from 'assert'
import * as TestHelpers from 'test-helpers'
import { rollback } from './index'

describe('flock-cli/actions/rollback', function () {
  it('should call rollback', async function () {
    const mockMigrator = new TestHelpers.MockMigrator()
    await rollback({
      showList: false,
      migrationId: 'one',
      migrator: mockMigrator
    })

    Assert.strictEqual(mockMigrator.migrate['calls'].length, 0)
    Assert.strictEqual(mockMigrator.rollback['calls'].length, 1)
    Assert.deepStrictEqual(mockMigrator.rollback['calls'][0].args, [ 'one' ])
  })
})
