/**
 * Determines if a table exists.
 *
 * The table must be accessible by the current user and created in the current
 * schema (i.e. The value of search_path setting).
 *
 * @param {pg.Client} client The postgres client instance
 * @param {string} tableName The migrations table name
 * @return {Promise<boolean>}
 */
async function tableExists (client, tableName) {
  // ANSI SQL compliant query. This should work for all RDMS.
  const query =
`SELECT EXISTS (
  SELECT 1
  FROM   information_schema.tables
  WHERE  table_name = $1
  AND table_schema = current_schema()
)`
  const values = [ tableName ]
  const result = await client.query(query, values)
  return result.rowCount === 1 ? !!result.rows[0].exists : false
}

/**
 * Determines if a column exists on the specified table.
 *
 * The table must be accessible by the current user and created in the current
 * schema (i.e. The value of search_path setting).
 *
 * @param {pg.Client} client The postgres client instance
 * @param {string} tableName The migrations table name
 * @param {string} columnName The column name to check
 * @return {Promise<boolean>}
 */
async function columnExists (client, tableName, columnName) {
  // ANSI SQL compliant query. This should work for all RDMS.
  const query =
`SELECT EXISTS (
  SELECT 1
  FROM   information_schema.columns
  WHERE  table_name = $1
  AND table_schema = current_schema()
  AND column_name = $2
)`
  const values = [ tableName, columnName ]
  const result = await client.query(query, values)
  return result.rowCount === 1 ? !!result.rows[0].exists : false
}

/**
 * Retrieves a row from `information_schema.columns` for the specified column.
 *
 * The table must be accessible by the current user and created in the current
 * schema (i.e. The value of search_path setting).
 *
 * @param {pg.Client} client The postgres client instance
 * @param {string} tableName The migrations table name
 * @param {string} columnName The column name to check
 * @return {Promise<{}>}
 */
async function inspectColumn (client, tableName, columnName) {
  // ANSI SQL compliant query. This should work for all RDMS.
  const query =
`SELECT *
FROM   information_schema.columns
WHERE  table_name = $1
AND table_schema = current_schema()
AND column_name = $2`
  const values = [ tableName, columnName ]
  const result = await client.query(query, values)
  return result.rowCount === 1 ? result.rows[0] : {}
}

/**
 * Retrieves a column's data_type value or null if the column or table do not
 * exist.
 *
 * The table must be accessible by the current user and created in the current
 * schema (i.e. The value of search_path setting).
 *
 * @param {pg.Client} client The postgres client instance
 * @param {string} tableName The migrations table name
 * @param {string} columnName The column name to check
 * @return {Promise<string | null>}
 */
async function columnDataType (client, tableName, columnName) {
  return inspectColumn(client, tableName, columnName).data_type || null
}

/**
 * Create a new object containing several useful functions.
 *
 * @param {pg.Client} client The postgres client
 */
function context (client) {
  return {
    tableExists: tableExists.bind(undefined, client),
    columnExists: columnExists.bind(undefined, client),
    inspectColumn: inspectColumn.bind(undefined, client),
    columnDataType: columnDataType.bind(undefined, client)
  }
}

exports.context = context
