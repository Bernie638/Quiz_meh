import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('quiz_history', (table) => {
    table.increments('id').primary();
    table.uuid('session_id').references('id').inTable('quiz_sessions').onDelete('CASCADE');
    table.string('user_identifier');
    
    // Quiz details
    table.enum('mode', ['immediate', 'practice']).notNullable();
    table.integer('total_questions').notNullable();
    table.integer('correct_answers').notNullable();
    table.decimal('score_percentage', 5, 2).notNullable();
    table.jsonb('topics_included').notNullable(); // Array of topic names
    table.jsonb('topic_scores').notNullable(); // Detailed topic performance
    
    // Timing
    table.timestamp('completed_at').notNullable();
    table.integer('time_spent_seconds').notNullable();
    
    // Performance metrics
    table.decimal('average_time_per_question', 6, 2);
    table.integer('questions_skipped').defaultTo(0);
    table.integer('questions_changed').defaultTo(0); // How many answers were changed
    
    table.timestamps(true, true);
    
    table.index(['user_identifier']);
    table.index(['completed_at']);
    table.index(['score_percentage']);
    table.index(['mode']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('quiz_history');
}