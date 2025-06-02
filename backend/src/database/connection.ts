import knex, { Knex } from 'knex';
import knexConfig from '../../knexfile';

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment as keyof typeof knexConfig];

if (!config) {
  throw new Error(`No database configuration found for environment: ${environment}`);
}

const db: Knex = knex(config);

// Test the connection
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Database connection established');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
  });

export default db;