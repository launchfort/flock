"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Assert = require("assert");
const zero_pad_1 = require("./zero-pad");
describe('formatting/zero-pad', function () {
    it('should not zero pad numbers longer than the minimum digits', function () {
        Assert.strictEqual(zero_pad_1.zeroPad(10, Infinity), '10');
        Assert.strictEqual(zero_pad_1.zeroPad(10, -1), '10');
        Assert.strictEqual(zero_pad_1.zeroPad(10, 0), '10');
        Assert.strictEqual(zero_pad_1.zeroPad(10, 1), '10');
        Assert.strictEqual(zero_pad_1.zeroPad(10, 2), '10');
        Assert.strictEqual(zero_pad_1.zeroPad(1, Infinity), '1');
        Assert.strictEqual(zero_pad_1.zeroPad(1, 1), '1');
    });
    it('should not zero pad numbers shorter than the minimum digits', function () {
        Assert.strictEqual(zero_pad_1.zeroPad(10, 3), '010');
        Assert.strictEqual(zero_pad_1.zeroPad(10, 4), '0010');
    });
});
