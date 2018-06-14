"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FileSystem = require("fs");
const Path = require("path");
/**
 * Attempts to recursively create a directory path.
 *
 * @param dir The directory path to create
 */
function mkdirp(dir) {
    if (!dir) {
        return Promise.reject(new Error('Empty directory encountered'));
    }
    return mkdir(dir).catch(error => {
        if (error.code === 'ENOENT') {
            return mkdirp(Path.dirname(dir)).then(() => {
                return mkdir(dir);
            });
        }
        else if (error.code === 'EEXIST') {
            return Promise.resolve();
        }
        else {
            return Promise.reject(error);
        }
    });
}
exports.mkdirp = mkdirp;
function mkdir(dir) {
    return new Promise((resolve, reject) => {
        FileSystem.mkdir(dir, error => {
            error ? reject(error) : resolve();
        });
    });
}
