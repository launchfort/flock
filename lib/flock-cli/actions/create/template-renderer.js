"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const Ejs = require("ejs");
class DefaultTemplateRenderer {
    constructor(dir = Path.join(__dirname, 'templates')) {
        this.dir = dir;
    }
    render(fileName, context) {
        return new Promise((resolve, reject) => {
            Ejs.renderFile(fileName, context, (error, str) => {
                error ? reject(error) : resolve(str);
            });
        });
    }
}
exports.DefaultTemplateRenderer = DefaultTemplateRenderer;
