"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const format_date_1 = require("./format-date");
describe('generate-migration-basename/format-date', function () {
    it('should format date with YYYY, MM and DD tokens', function () {
        assert.strictEqual(format_date_1.formatDate(new Date(2018, 0, 1), 'YYYY-MM-DD'), '2018-01-01');
        assert.strictEqual(format_date_1.formatDate(new Date(2018, 0, 1), 'YYYY-MM-DDF'), '2018-01-01F');
    });
});
