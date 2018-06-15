import * as Flock from 'flock';
import { Answers } from './prompt';
interface Options extends Answers {
    showList: boolean;
    migrator: Flock.Migrator;
}
export declare function migrate({ showList, migrationId, migrator }: Options): Promise<void>;
export {};
