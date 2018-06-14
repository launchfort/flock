"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FileSystem = require("fs");
function touch(fileName) {
    return new Promise((resolve, reject) => {
        FileSystem.writeFile(fileName, '', { encoding: 'utf8' }, error => {
            error ? reject(error) : resolve();
        });
    });
}
exports.touch = touch;
