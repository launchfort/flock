export interface TemplateProvider {
    /** Supported migration types (i.e. [ 'create-table', 'alter-table', 'other' ]) */
    readonly migrationTypes: string[];
    provideFileName(migrationType: string): Promise<string>;
}
export declare class DefaultTemplateProvider implements TemplateProvider {
    readonly migrationTypes: string[];
    private dir;
    constructor(dir?: string);
    provideFileName(migrationType: string): Promise<string>;
}
