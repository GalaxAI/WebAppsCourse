// Database configuration file - src/config/database.ts

import { Sequelize } from 'sequelize';
import path from 'path';

const dbPath = path.join(__dirname, '../../database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: console.log
});

export default sequelize;