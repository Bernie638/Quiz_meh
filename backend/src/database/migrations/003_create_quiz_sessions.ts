import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('quiz_sessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('user_identifier'); // For future user system, nullable for now
    
    // Quiz configuration
    table.enum('mode', ['immediate', 'practice']).notNullable();
    table.jsonb('selected_topics').notNullable(); // Array of topic IDs
    table.integer('question_count').notNullable();
    table.jsonb('question_ids').notNullable(); // Array of question IDs in order
    
    // Session state
    table.integer('current_question_index').defaultTo(0);
    table.jsonb('answers').defaultTo('{}'); // questionId -> selectedAnswer mapping
    table.integer('correct_answers').defaultTo(0);
    table.integer('total_questions').notNullable();
    
    // Timing
    table.timestamp('started_at').defaultTo(knex.fn.now());
    table.timestamp('completed_at');
    table.integer('time_spent_seconds');
    
    // Scoring
    table.decimal('score_percentage', 5, 2);
    table.jsonb('topic_scores').defaultTo('{}'); // topic -> {correct, total, percentage}
    
    // Status
    table.enum('status', ['active', 'completed', 'abandoned']).defaultTo('active');
    
    table.timestamps(true, true);
    
    table.index(['user_identifier']);
    table.index(['mode']);
    table.index(['status']);
    table.index(['completed_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('quiz_sessions');
}