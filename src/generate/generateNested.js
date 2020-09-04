import moment from 'moment';
import { randomFloat } from './utils';

const INSERT_IOT = `
  INSERT INTO iot_original_data(source_id, time, data) values (:source_id, :time, :data::jsonb);
`;

const generateData = async (db, sourceId, start, end, sensors) => {
  const startTime = moment(start).startOf('second');
  const endTime = moment(end).startOf('second');
  const interval = sensors[0].interval || 60;

  const nextDataFns = sensors.reduce((acc, sensor) => {
    const {
      label,
      dataFn = randomFloat()
    } = sensor;

    acc[label] = dataFn;
    return acc;
  }, {});

  const getNextData = () => Object.keys(nextDataFns).reduce((acc, label) => {
    acc[label] = nextDataFns[label]();
    return acc;
  }, {});

  while (startTime.isBefore(endTime)) {
    const nextData = getNextData();
    await db.query(INSERT_IOT, {
      replacements: {
        source_id: sourceId,
        time: startTime.toDate(),
        data: JSON.stringify(nextData)
      }
    });
    startTime.add(interval, 'seconds');
  }
};

export default async (db, sensors, start, end) => {
  const sources = Object.keys(sensors);
  for (let j = 0; j < sources.length; j++) {
    const source = sources[j];
    await generateData(db, source, start, end, sensors[source]);
  }
};