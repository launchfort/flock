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
const prompt_1 = require("../prompt");
function prompt({ showList, migrator, answers = {} }) {
    return __awaiter(this, void 0, void 0, function* () {
        return prompt_1.prompt([
            showList ? {
                type: 'list',
                name: 'migrationId',
                message: 'Choose a migration to migrate up to (inclusive)',
                default: () => __awaiter(this, void 0, void 0, function* () {
                    const migrationState = yield migrator.getMigrationState();
                    return (migrationState.slice(-1).pop() || {}).id;
                }),
                choices: () => __awaiter(this, void 0, void 0, function* () {
                    const migrationState = yield migrator.getMigrationState();
                    const choices = migrationState.map(x => ({
                        value: x.id,
                        name: `${x.migrated ? '✓' : '✗'} ${x.id}`
                    }));
                    return choices;
                })
            } : null
        ].filter(Boolean), { answers });
    });
}
exports.prompt = prompt;
