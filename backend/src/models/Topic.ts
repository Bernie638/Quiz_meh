import db from '../database/connection';

export interface Topic {
  id: number;
  slug: string;
  name: string;
  description?: string;
  category: string;
  question_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTopicData {
  slug: string;
  name: string;
  description?: string;
  category?: string;
  question_count?: number;
}

export class TopicModel {
  static async findAll(): Promise<Topic[]> {
    return db<Topic>('topics')
      .select('*')
      .orderBy('name');
  }

  static async findBySlug(slug: string): Promise<Topic | undefined> {
    return db<Topic>('topics')
      .where({ slug })
      .first();
  }

  static async findById(id: number): Promise<Topic | undefined> {
    return db<Topic>('topics')
      .where({ id })
      .first();
  }

  static async create(data: CreateTopicData): Promise<Topic> {
    const [topic] = await db<Topic>('topics')
      .insert(data)
      .returning('*');
    return topic;
  }

  static async updateQuestionCount(topicId: number, count: number): Promise<void> {
    await db<Topic>('topics')
      .where({ id: topicId })
      .update({ question_count: count });
  }

  static async findWithQuestionCounts(): Promise<Topic[]> {
    return db<Topic>('topics')
      .select('topics.*')
      .select(db.raw('COUNT(questions.id) as actual_question_count'))
      .leftJoin('questions', 'topics.id', 'questions.topic_id')
      .groupBy('topics.id')
      .orderBy('topics.name');
  }

  static async getTopicStats(): Promise<Record<string, any>> {
    const stats = await db<Topic>('topics')
      .select(
        db.raw('COUNT(*) as total_topics'),
        db.raw('SUM(question_count) as total_questions'),
        db.raw('AVG(question_count) as avg_questions_per_topic'),
        db.raw('MAX(question_count) as max_questions'),
        db.raw('MIN(question_count) as min_questions')
      )
      .first();

    return stats || {};
  }
}