"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const FileSystem = require("fs");
const Path = require("path");
const template_renderer_1 = require("./template-renderer");
const mkdirp_1 = require("./mkdirp");
const prompt_1 = require("./prompt");
const renderer = new template_renderer_1.DefaultTemplateRenderer();
function create({ migrationDir, templateProvider, migrationType, migrationName, tableName }) {
    return __awaiter(this, void 0, void 0, function* () {
        const promptOptions = {
            migrationDir,
            migrationTypes: templateProvider.migrationTypes.slice(),
            answers: { migrationType, migrationName, tableName }
        };
        const answers = yield prompt_1.prompt(promptOptions);
        ({ migrationType, migrationName, tableName } = answers);
        const templateFileName = yield templateProvider.provideFileName(migrationType);
        const outFileName = `${migrationDir}/${migrationName}`;
        const str = yield renderer.render(templateFileName, { tableName });
        yield mkdirp_1.mkdirp(Path.dirname(outFileName));
        return new Promise((resolve, reject) => {
            FileSystem.writeFile(outFileName, str, { encoding: 'utf8' }, error => {
                error ? reject(error) : resolve();
            });
        });
    });
}
exports.create = create;
