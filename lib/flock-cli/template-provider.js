"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
class DefaultTemplateProvider {
    constructor(dir = Path.join(__dirname, 'templates')) {
        this.migrationTypes = [];
        this.dir = dir;
    }
    provideFileName(migrationType) {
        const fileName = Path.join(this.dir, 'default.ejs');
        return Promise.resolve(fileName);
    }
}
exports.DefaultTemplateProvider = DefaultTemplateProvider;
