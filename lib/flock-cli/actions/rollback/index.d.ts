import * as Flock from '../../../index';
import { Answers } from './prompt';
interface Options extends Answers {
    showList: boolean;
    migrator: Flock.Migrator;
}
export declare function rollback({ showList, migrationId, migrator }: Options): Promise<void>;
export {};
