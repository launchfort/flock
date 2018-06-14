import * as assert from 'assert'
import { formatDate } from './format-date'

describe('generate-migration-basename/format-date', function () {
  it('should format date with YYYY, MM and DD tokens', function () {
    assert.strictEqual(formatDate(new Date(2018, 0, 1), 'YYYY-MM-DD'), '2018-01-01')
    assert.strictEqual(formatDate(new Date(2018, 0, 1), 'YYYY-MM-DDF'), '2018-01-01F')
  })
})
