import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('user_stats', (table) => {
    table.increments('id').primary();
    table.string('user_identifier').unique().notNullable();
    
    // Overall statistics
    table.integer('total_quizzes').defaultTo(0);
    table.decimal('average_score', 5, 2).defaultTo(0);
    table.decimal('best_score', 5, 2).defaultTo(0);
    table.integer('total_questions_answered').defaultTo(0);
    table.integer('total_correct_answers').defaultTo(0);
    
    // Topic performance
    table.jsonb('topic_performance').defaultTo('{}'); // topic -> {attempted, correct, best_score, last_attempted}
    
    // Streaks and achievements
    table.integer('current_streak').defaultTo(0);
    table.integer('best_streak').defaultTo(0);
    table.timestamp('last_quiz_date');
    table.timestamp('first_quiz_date');
    
    // Preferences
    table.jsonb('preferred_topics').defaultTo('[]');
    table.enum('preferred_mode', ['immediate', 'practice']);
    table.integer('preferred_question_count').defaultTo(50);
    
    table.timestamps(true, true);
    
    table.index(['user_identifier']);
    table.index(['last_quiz_date']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('user_stats');
}