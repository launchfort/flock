"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FileSystem = require("fs");
const OS = require("os");
const Path = require("path");
const Crypto = require("crypto");
function randomFileName({ ext = '' } = {}) {
    return new Promise((resolve, reject) => {
        Crypto.randomBytes(48, (error, buffer) => {
            error ? reject(error) : resolve(buffer.toString('hex') + ext);
        });
    });
}
exports.randomFileName = randomFileName;
function tmpdir() {
    return randomFileName().then(baseName => {
        return Path.join(OS.tmpdir(), baseName);
    }).then(dir => {
        return new Promise((resolve, reject) => {
            FileSystem.mkdir(dir, error => error ? reject(error) : resolve(dir));
        });
    });
}
exports.tmpdir = tmpdir;
