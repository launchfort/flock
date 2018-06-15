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
const prompt_1 = require("./prompt");
function rollback({ showList, migrationId, migrator }) {
    return __awaiter(this, void 0, void 0, function* () {
        const answers = yield prompt_1.prompt({ showList, migrator, answers: { migrationId } });
        let times = {};
        migrator.on('rollbacking', function ({ migrationId }) {
            times[migrationId] = Date.now();
            console.log(`Rollback migration ${migrationId} started`);
        });
        migrator.on('rollback', function ({ migrationId }) {
            const duration = ((Date.now() - (times[migrationId] || 0)) / 1000).toFixed(2);
            console.log(`Rollback migration ${migrationId} finished in ${duration} seconds`);
        });
        const t = Date.now();
        const time = ((Date.now() - t) / 1000).toFixed(3);
        yield migrator.rollback(answers.migrationId);
        migrator.removeAllListeners();
        console.log(`Migrations successfully rolled back in ${time} seconds`);
    });
}
exports.rollback = rollback;
