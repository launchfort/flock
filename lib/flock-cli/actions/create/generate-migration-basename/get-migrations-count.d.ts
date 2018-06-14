/**
 * Count the number of migrations that have been created in the migrations
 * directory. If the prefix is specified then counts the number of migrations
 * that start with the prefix. If migrationDir is falsey or the directory it
 * refers to does not exist then resolves to 0.
 *
 * @example getMigrationsCount('migrations').then(count => ...)
 * @example getMigrationsCount('migrations', { prefix: '2018-01-05' }).then(count => ...)
 * @param migrationDir The migration directory
 * @param prefix The optional migration file prefix
 */
export declare function getMigrationsCount(migrationDir: string, { prefix }?: {
    prefix?: any;
}): Promise<number>;
