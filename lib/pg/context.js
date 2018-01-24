async function tableExists (client, tableName) {
  // ANSI SQL compliant query. This should work for all RDMS.
  const query =
`SELECT EXISTS (
  SELECT 1
  FROM   information_schema.tables
  WHERE  table_name = $1
)`
  const values = [ tableName ]
  const result = await client.query(query, values)
  return result.rowCount === 1 ? !!result.rows[0].exists : false
}

async function columnExists (client, tableName, columnName) {
  // ANSI SQL compliant query. This should work for all RDMS.
  const query =
`SELECT EXISTS (
  SELECT 1
  FROM   information_schema.columns
  WHERE  table_name = $1
  AND column_name = $2
)`
  const values = [ tableName, columnName ]
  const result = await client.query(query, values)
  return result.rowCount === 1 ? !!result.rows[0].exists : false
}

async function inspectColumn (client, tableName, columnName) {
  // ANSI SQL compliant query. This should work for all RDMS.
  const query =
`SELECT *
FROM   information_schema.columns
WHERE  table_name = $1
AND column_name = $2`
  const values = [ tableName, columnName ]
  const result = await client.query(query, values)
  return result.rowCount === 1 ? result.rows[0] : {}
}

async function columnDataType (client, tableName, columnName) {
  return inspectColumn(client, tableName, columnName).data_type || null
}

function context (client) {
  return {
    tableExists: tableExists.bind(undefined, client),
    columnExists: columnExists.bind(undefined, client),
    inspectColumn: inspectColumn.bind(undefined, client),
    columnDataType: columnDataType.bind(undefined, client)
  }
}

exports.context = context
