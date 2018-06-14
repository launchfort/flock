export interface TemplateProvider {
    readonly migrationTypes: string[];
    provideFileName(migrationType: string): Promise<string>;
}
export declare class DefaultTemplateProvider implements TemplateProvider {
    readonly migrationTypes: string[];
    private dir;
    constructor(dir?: string);
    provideFileName(migrationType: string): Promise<string>;
}
