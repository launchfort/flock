import * as Assert from 'assert'
import { formatDate } from './format-date'

describe('generate-migration-basename/format-date', function () {
  it('should format date with YYYY, MM and DD tokens', function () {
    Assert.strictEqual(formatDate(new Date(2018, 0, 1), 'YYYY-MM-DD'), '2018-01-01')
    Assert.strictEqual(formatDate(new Date(2018, 0, 1), 'YYYY-MM-DDF'), '2018-01-01F')
  })
})
