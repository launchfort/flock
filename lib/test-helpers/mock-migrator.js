"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const spy_1 = require("./spy");
class MockMigrator extends events_1.EventEmitter {
    constructor(migrationState = []) {
        super();
        this.migrationState = migrationState.slice();
        this.migrate = spy_1.spy(() => Promise.resolve());
        this.rollback = spy_1.spy(() => Promise.resolve());
        // Silence all events
        this.emit = (...args) => { return false; };
    }
    getMigrationState() {
        return Promise.resolve(this.migrationState);
    }
    migrate(migrationId) {
        return Promise.resolve();
    }
    rollback(migrationId) {
        return Promise.resolve();
    }
}
exports.MockMigrator = MockMigrator;
