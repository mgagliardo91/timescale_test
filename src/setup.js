/** IOT TABLE */
const CREATE_IOT_TABLE = `
  CREATE TABLE IF NOT EXISTS iot_data(
    source_id int not null,
    time timestamptz not null,
    label varchar not null,
    data jsonb not null,
    metadata jsonb
  );
`;

const CREATE_COMP_INDEX = `CREATE INDEX IF NOT EXISTS iot_data_id_time_idx ON iot_data(source_id, time DESC)`;

const CREATE_NUMERIC_INDEX = `
  CREATE INDEX IF NOT EXISTS iot_data_numeric
  ON iot_data(((data->>'value')::double precision))
  WHERE data ? 'value';
`;

const CREATE_TEXT_INDEX = `
  CREATE INDEX IF NOT EXISTS iot_data_text
  ON iot_data(((data->>'text')::varchar))
  WHERE data ? 'text';
`;

const CREATE_HYPER = `SELECT create_hypertable('iot_data', 'time', if_not_exists => TRUE);`;

const REORDER_POLICY = `SELECT add_reorder_policy('iot_data', 'iot_data_id_time_idx', if_not_exists => TRUE);`;

/** ORIGINAL_TABLE */
const CREATE_SOURCE_DATA = `
  CREATE TABLE iot_original_data(
    source_id int not null,
    time timestamptz not null,
    data jsonb not null,
    primary key (source_id, time)
  );
`;

const CREATE_SOURCE_DATA_HYPER = `
  SELECT create_hypertable('iot_original_data', 'time');
`;

/** NO_JSON_TABLE */
const CREATE_COLUMN_IOT_TABLE = `
  CREATE TABLE IF NOT EXISTS iot_column_data(
    source_id int not null,
    time timestamptz not null,
    label varchar not null,
    value_numeric float,
    value_text varchar,
    metadata jsonb
  );
`;

const CREATE_COLUMN_COMP_INDEX = `CREATE INDEX IF NOT EXISTS iot_column_data_id_time_idx ON iot_column_data(source_id, time DESC)`;

const CREATE_COLUMN_HYPER = `SELECT create_hypertable('iot_column_data', 'time', if_not_exists => TRUE);`;

const REORDER_COLUMN_POLICY = `SELECT add_reorder_policy('iot_column_data', 'iot_column_data_id_time_idx', if_not_exists => TRUE);`;


/** COMMON */

const TABLE_EXISTS = (table) => `
  SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE  table_schema = 'public'
  AND    table_name   = '${table}'
  );
`;

const setupSchema = async (db) => {
  let result = await db.query(TABLE_EXISTS('iot_data'), { plain: true });
  if (!result.exists) {
    await db.query(CREATE_IOT_TABLE, { raw: true });
    await db.query(CREATE_COMP_INDEX, { raw: true });
    await db.query(CREATE_NUMERIC_INDEX, { raw: true });
    await db.query(CREATE_TEXT_INDEX, { raw: true });
    await db.query(CREATE_HYPER, { raw: true });
    await db.query(REORDER_POLICY, { raw: true });
  }

  result = await db.query(TABLE_EXISTS('iot_original_data'), { plain: true });
  if (!result.exists) {
    await db.query(CREATE_SOURCE_DATA);
    await db.query(CREATE_SOURCE_DATA_HYPER);
  }

  result = await db.query(TABLE_EXISTS('iot_column_data'), { plain: true });
  if (!result.exists) {
    await db.query(CREATE_COLUMN_IOT_TABLE);
    await db.query(CREATE_COLUMN_COMP_INDEX);
    await db.query(CREATE_COLUMN_HYPER);
    await db.query(REORDER_COLUMN_POLICY);
  }
}

export default setupSchema;