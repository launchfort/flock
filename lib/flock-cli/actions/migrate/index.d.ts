import { Answers } from './prompt';
interface Options extends Answers {
    showList: boolean;
    migrator: any;
}
export declare function migrate({ showList, migrationId, migrator }: Options): Promise<void>;
export {};
