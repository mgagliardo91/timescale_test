import 'dotenv/config';
import moment from 'moment';
import db from './database';
import setup from './setup';
import { generateFlattened, generateNested, generateColumn } from './generate';
import { randomText } from './generate/utils';

const start = async () => {
  await db.authenticate();
  await setup(db);
  

  const sensors = {
    '113': [{
      label: 'SEN01',
      metadata: {
        batch_number: 1
      }
    },{
      label: 'SEN02',
      dataFn: randomText,
      type: 'TEXT'
    },{
      label: 'SEN03',
      metadata: {
        batch_number: 2
      }
    },{
      label: 'SEN04',
      metadata: {
        batch_number: 3
      }
    }],
    '114': [{
      label: 'SEN01',
      metadata: {
        batch_number: 2
      }
    }]
  };

  const end = moment();
  const start = moment(end).subtract(2, 'months');
  await Promise.all([
    generateFlattened(db, sensors, start, end),
    generateColumn(db, sensors, start, end),
    generateNested(db, sensors, start, end)
  ]);
};

start();