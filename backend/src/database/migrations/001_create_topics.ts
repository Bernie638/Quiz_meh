import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('topics', (table) => {
    table.increments('id').primary();
    table.string('slug').unique().notNullable();
    table.string('name').notNullable();
    table.text('description');
    table.string('category').defaultTo('nuclear');
    table.integer('question_count').defaultTo(0);
    table.timestamps(true, true);
    
    table.index(['slug']);
    table.index(['category']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('topics');
}