"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function spy(fn) {
    let calls = [];
    let f = ((...args) => {
        const returnValue = fn(...args);
        calls.push({ args, returnValue });
        return returnValue;
    });
    f.calls = calls;
    return f;
}
exports.spy = spy;
