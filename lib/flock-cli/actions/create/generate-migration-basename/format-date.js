"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zero_pad_1 = require("./zero-pad");
/**
 * Attempts to format a Date object to a string.
 *
 * @param d The Date object to format
 * @param format The format string that contains tokens
 */
function formatDate(d, format = 'YYYY-MM-DD') {
    return format.replace(/YYYY/g, () => {
        return d.getFullYear().toString();
    }).replace(/DD/g, () => {
        return zero_pad_1.zeroPad(d.getDate(), 2);
    }).replace(/MM/g, () => {
        return zero_pad_1.zeroPad(d.getMonth() + 1, 2);
    });
}
exports.formatDate = formatDate;
