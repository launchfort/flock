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
const generate_migration_basename_1 = require("./generate-migration-basename");
function prompt({ migrationDir, migrationTypes, answers = {} }) {
    return __awaiter(this, void 0, void 0, function* () {
        const questions = [
            {
                type: 'list',
                name: 'migrationType',
                message: 'Choose the type of migration',
                when: migrationTypes.length > 0,
                default: () => migrationTypes.length > 0 ? '' : 'default',
                choices: migrationTypes.map(x => {
                    return {
                        // Make name proper case; words separted with '-' are uppercased
                        name: x.split('-')
                            .filter(Boolean)
                            .map(x => x[0].toUpperCase() + x.substr(1))
                            .join(' '),
                        value: x
                    };
                })
            },
            {
                type: 'input',
                name: 'tableName',
                message: 'What table is being migrated?',
                validate: (tableName, a) => {
                    if (!tableName) {
                        throw new Error('Please specify the table being migrated');
                    }
                    else {
                        return true;
                    }
                }
            },
            {
                type: 'input',
                name: 'migrationName',
                message: 'What is the file name of the migration?',
                default: (a) => {
                    const { tableName, migrationType } = a;
                    return generate_migration_basename_1.generateMigrationBasename(migrationType, tableName, { migrationDir });
                }
            }
        ];
        return prompt_1.prompt(questions, { answers });
    });
}
exports.prompt = prompt;
