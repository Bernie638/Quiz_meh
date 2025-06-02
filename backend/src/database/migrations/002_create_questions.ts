import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('questions', (table) => {
    table.increments('id').primary();
    table.integer('original_id').unique().notNullable(); // The 1000+ IDs from extraction
    table.integer('topic_id').references('id').inTable('topics').onDelete('CASCADE');
    table.integer('page_number');
    
    // Question content
    table.text('question_text').notNullable();
    table.jsonb('question_formatting').defaultTo('{}');
    table.boolean('question_multiline').defaultTo(false);
    
    // Given information
    table.boolean('has_given_info').defaultTo(false);
    table.jsonb('given_info_table').defaultTo('{}');
    table.jsonb('given_info_raw').defaultTo('[]');
    
    // Answer choices
    table.jsonb('choices').notNullable(); // Array of choice objects
    table.string('correct_answer', 1).notNullable(); // A, B, C, or D
    
    // Images
    table.jsonb('images').defaultTo('[]'); // Array of image objects
    
    // Metadata
    table.jsonb('raw_content').defaultTo('[]');
    table.timestamps(true, true);
    
    table.index(['original_id']);
    table.index(['topic_id']);
    table.index(['correct_answer']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('questions');
}