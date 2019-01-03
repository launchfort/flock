import * as Assert from 'assert'
import { zeroPad } from './zero-pad'

describe('formatting/zero-pad', function () {
  it('should not zero pad numbers longer than the minimum digits', function () {
    Assert.strictEqual(zeroPad(10, Infinity), '10')
    Assert.strictEqual(zeroPad(10, -1), '10')
    Assert.strictEqual(zeroPad(10, 0), '10')
    Assert.strictEqual(zeroPad(10, 1), '10')
    Assert.strictEqual(zeroPad(10, 2), '10')
    Assert.strictEqual(zeroPad(1, Infinity), '1')
    Assert.strictEqual(zeroPad(1, 1), '1')
  })

  it('should not zero pad numbers shorter than the minimum digits', function () {
    Assert.strictEqual(zeroPad(10, 3), '010')
    Assert.strictEqual(zeroPad(10, 4), '0010')
  })
})
