"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path = require("path");
class NodeModuleMigrationProvider {
    constructor(dir = 'migrations', options) {
        const { filter = (x) => true } = (options || {});
        this.dir = dir;
        this.filter = filter;
    }
    provide() {
        return new Promise((resolve, reject) => {
            fs_1.readdir(this.dir, (error, files) => {
                error ? reject(error) : resolve(files);
            });
        }).then((files) => {
            return files
                // Ignore modules that start with '_' or '.'
                .filter(x => !x.startsWith('_') && !x.startsWith('.'))
                // Ignore modules that end with .db (i.e. thumbs.db)
                .filter(x => !x.endsWith('.db'))
                // Ignore modules that end with known mimetype extension
                .filter(x => /\.(?:jpg|jpeg|gif|png|pdf|docx|doc|xml|txt|css|csv|xlsx|md)$/i.test(x) === false)
                .filter(this.filter)
                // Sort files alphabetically
                .sort(((a, b) => a.localeCompare(b)))
                .map(x => new NodeModuleMigration(path.join(this.dir, x)));
        });
    }
}
exports.NodeModuleMigrationProvider = NodeModuleMigrationProvider;
class NodeModuleMigration {
    constructor(fileName) {
        try {
            this.module = require(path.resolve(fileName));
        }
        catch (error) {
            if (error.code === 'MODULE_NOT_FOUND') {
                throw new Error(`Cannot load migration as a Node module [${fileName}]. Prefix with '_' to ignore.`);
            }
            else {
                throw error;
            }
        }
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
