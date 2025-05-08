const { Sequelize } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Determine if we should use SQLite or PostgreSQL
const usePostgres = process.env.USE_POSTGRES === 'true';

let sequelize;

if (usePostgres) {
  // PostgreSQL configuration
  sequelize = new Sequelize(
    process.env.DB_NAME || 'notes_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'postgres',
      logging: false,
    }
  );
} else {
  // SQLite configuration (default for demo)
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    logging: false,
  });
}

module.exports = sequelize;