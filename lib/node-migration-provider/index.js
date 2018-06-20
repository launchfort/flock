"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path = require("path");
class NodeModuleMigrationProvider {
    constructor(dir = 'migrations') {
        this.dir = dir;
    }
    provide() {
        return new Promise((resolve, reject) => {
            fs_1.readdir(this.dir, (error, files) => {
                error ? reject(error) : resolve(files);
            });
        }).then((files) => {
            return files
                // Sort files alphabetically
                .sort(((a, b) => a.localeCompare(b)))
                .map(x => new NodeModuleMigration(path.join(this.dir, x)));
        });
    }
}
exports.NodeModuleMigrationProvider = NodeModuleMigrationProvider;
class NodeModuleMigration {
    constructor(fileName) {
        this.module = require(path.resolve(fileName));
        this.id = path.basename(fileName, path.extname(fileName));
        if (!this.module) {
            throw new Error('Invalid migration, must have an up() and down() functions');
        }
        else if (typeof this.module.up !== 'function') {
            throw new Error('Migration missing up() function');
        }
        else if (typeof this.module.down !== 'function') {
            throw new Error('Migration missing down() function');
        }
    }
    up(queryInterface) {
        return this.module.up(queryInterface);
    }
    down(queryInterface) {
        return this.module.down(queryInterface);
    }
}
exports.NodeModuleMigration = NodeModuleMigration;
