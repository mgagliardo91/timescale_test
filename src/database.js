import Sequelize from 'sequelize';

const connect = process.env.CONNECTION_STRING || `postgres://user:pass@localhost:5107/db`;
const sequelize = new Sequelize(connect,
{
    dialect: 'postgres',
    protocol: 'postgres'
});

export default sequelize;