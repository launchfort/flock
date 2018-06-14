export interface TemplateRenderer {
    render(migrationType: string, context: any): Promise<string>;
}
export declare class DefaultTemplateRenderer implements TemplateRenderer {
    private dir;
    constructor(dir?: string);
    render(fileName: string, context: any): Promise<string>;
}
