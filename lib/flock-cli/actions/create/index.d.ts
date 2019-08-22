import { TemplateProvider } from '../../template-provider';
import { Answers } from './prompt';
interface Options extends Answers {
    migrationDir: string;
    templateProvider: TemplateProvider;
}
export declare function create({ migrationDir, templateProvider, migrationType, migrationName, tableName }: Options): Promise<unknown>;
export {};
