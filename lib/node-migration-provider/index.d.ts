import { MigrationProvider, Migration, QueryInterface } from '../index';
export declare class NodeModuleMigrationProvider implements MigrationProvider {
    dir: string;
    constructor(dir?: string);
    provide(): Promise<Migration[]>;
}
export declare class NodeModuleMigration implements Migration {
    id: string;
    module: any;
    constructor(fileName: any);
    up(queryInterface: QueryInterface): any;
    down(queryInterface: QueryInterface): any;
}
