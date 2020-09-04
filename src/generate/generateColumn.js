import moment from 'moment';
import { randomFloat } from './utils';

const INSERT_IOT_NUMERIC = `
  INSERT INTO iot_column_data(source_id, time, label, value_numeric, metadata) values (:source_id, :time, :label, :data, :metadata::jsonb);
`;

const INSERT_IOT_TEXT = `
  INSERT INTO iot_column_data(source_id, time, label, value_text, metadata) values (:source_id, :time, :label, :data, :metadata::jsonb);
`;

const generateData = async (db, sourceId, start, end, opts) => {
  const {
    label,
    dataFn = randomFloat(),
    interval = 60,
    type = 'NUMERIC',
    metadata = {}
  } = opts;

  const query = type == 'NUMERIC' ? INSERT_IOT_NUMERIC : INSERT_IOT_TEXT;
  const startTime = moment(start).startOf('second');
  const endTime = moment(end).startOf('second');

  while (startTime.isBefore(endTime)) {
    const nextData = dataFn();
    let data;
    if (type == 'NUMERIC') {
      data = parseFloat(nextData); 
    } else {
      data = `${nextData}`;
    }
    await db.query(query, {
      replacements: {
        source_id: sourceId,
        time: startTime.toDate(),
        label,
        data,
        metadata: JSON.stringify(metadata)
      }
    });
    startTime.add(interval, 'seconds');
  }
};

export default async (db, sensors, start, end) => {
  await Promise.all(Object.keys(sensors).map(source => 
    Promise.all(sensors[source].map(s => generateData(db, source, start, end, s)))));
};