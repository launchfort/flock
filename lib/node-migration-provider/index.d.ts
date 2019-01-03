import { MigrationProvider, Migration, QueryInterface } from '../index';
export declare class NodeModuleMigrationProvider implements MigrationProvider {
    dir: string;
    private filter;
    constructor(dir?: string, options?: {
        filter: (fileName: string) => boolean;
    });
    provide(): Promise<Migration[]>;
}
export declare class NodeModuleMigration implements Migration {
    id: string;
    module: any;
    constructor(fileName: any);
    up(queryInterface: QueryInterface): any;
    down(queryInterface: QueryInterface): any;
}
