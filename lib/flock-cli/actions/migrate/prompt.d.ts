export interface Answers {
    migrationId?: string;
}
export interface Options {
    showList: boolean;
    migrator: any;
    answers?: Answers;
}
export declare function prompt({ showList, migrator, answers }: Options): Promise<Answers>;
