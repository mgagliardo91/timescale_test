import moment from 'moment';
import { randomFloat } from './utils';

const INSERT_IOT = `
  INSERT INTO iot_data(source_id, time, label, data, metadata) values (:source_id, :time, :label, :data::jsonb, :metadata::jsonb);
`;

const generateData = async (db, sourceId, start, end, opts) => {
  const {
    label,
    dataFn = randomFloat(),
    interval = 60,
    type = 'NUMERIC',
    metadata = {}
  } = opts;

  const startTime = moment(start).startOf('second');
  const endTime = moment(end).startOf('second');

  while (startTime.isBefore(endTime)) {
    const nextData = dataFn();
    let data;
    if (type == 'NUMERIC') {
      data = {
        value: parseFloat(nextData)
      };
    } else {
      data = {
        text: `${nextData}`
      };
    }
    await db.query(INSERT_IOT, {
      replacements: {
        source_id: sourceId,
        time: startTime.toDate(),
        label,
        data: JSON.stringify(data),
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