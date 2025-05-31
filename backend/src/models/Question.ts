import db from '../database/connection';

export interface Question {
  id: number;
  original_id: number;
  topic_id: number;
  page_number?: number;
  question_text: string;
  question_formatting: any;
  question_multiline: boolean;
  has_given_info: boolean;
  given_info_table: any;
  given_info_raw: any[];
  choices: any[];
  correct_answer: string;
  images: any[];
  raw_content?: any[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateQuestionData {
  original_id: number;
  topic_id: number;
  page_number?: number;
  question_text: string;
  question_formatting?: any;
  question_multiline?: boolean;
  has_given_info?: boolean;
  given_info_table?: any;
  given_info_raw?: any[];
  choices: any[];
  correct_answer: string;
  images?: any[];
  raw_content?: any[];
}

export interface QuestionWithTopic extends Question {
  topic_name: string;
  topic_slug: string;
}

export interface QuestionFilter {
  topicIds?: number[];
  difficulty?: string;
  hasImages?: boolean;
  limit?: number;
  offset?: number;
  randomize?: boolean;
}

export class QuestionModel {
  static async findAll(filter: QuestionFilter = {}): Promise<Question[]> {
    let query = db<Question>('questions').select('*');

    if (filter.topicIds && filter.topicIds.length > 0) {
      query = query.whereIn('topic_id', filter.topicIds);
    }

    if (filter.hasImages !== undefined) {
      if (filter.hasImages) {
        query = query.whereRaw("json_array_length(images) > 0");
      } else {
        query = query.whereRaw("json_array_length(images) = 0");
      }
    }

    if (filter.randomize) {
      query = query.orderByRaw('RANDOM()');
    } else {
      query = query.orderBy('original_id');
    }

    if (filter.limit) {
      query = query.limit(filter.limit);
    }

    if (filter.offset) {
      query = query.offset(filter.offset);
    }

    return query;
  }

  static async findWithTopics(filter: QuestionFilter = {}): Promise<QuestionWithTopic[]> {
    let query = db<Question>('questions')
      .select(
        'questions.*',
        'topics.name as topic_name',
        'topics.slug as topic_slug'
      )
      .join('topics', 'questions.topic_id', 'topics.id');

    if (filter.topicIds && filter.topicIds.length > 0) {
      query = query.whereIn('questions.topic_id', filter.topicIds);
    }

    if (filter.hasImages !== undefined) {
      if (filter.hasImages) {
        query = query.whereRaw("json_array_length(questions.images) > 0");
      } else {
        query = query.whereRaw("json_array_length(questions.images) = 0");
      }
    }

    if (filter.randomize) {
      query = query.orderByRaw('RANDOM()');
    } else {
      query = query.orderBy('questions.original_id');
    }

    if (filter.limit) {
      query = query.limit(filter.limit);
    }

    if (filter.offset) {
      query = query.offset(filter.offset);
    }

    return query;
  }

  static async findById(id: number): Promise<Question | undefined> {
    return db<Question>('questions')
      .where({ id })
      .first();
  }

  static async findByOriginalId(originalId: number): Promise<Question | undefined> {
    return db<Question>('questions')
      .where({ original_id: originalId })
      .first();
  }

  static async findByTopicId(topicId: number): Promise<Question[]> {
    return db<Question>('questions')
      .where({ topic_id: topicId })
      .orderBy('original_id');
  }

  static async create(data: CreateQuestionData): Promise<Question> {
    const [question] = await db<Question>('questions')
      .insert(data)
      .returning('*');
    return question;
  }

  static async bulkCreate(questions: CreateQuestionData[]): Promise<void> {
    const batchSize = 1000;
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);
      await db<Question>('questions').insert(batch);
    }
  }

  static async getRandomQuestions(
    topicIds: number[], 
    count: number, 
    distributionStrategy: 'even' | 'proportional' = 'even'
  ): Promise<Question[]> {
    if (distributionStrategy === 'even') {
      return this.getEvenlyDistributedQuestions(topicIds, count);
    } else {
      return this.getProportionallyDistributedQuestions(topicIds, count);
    }
  }

  private static async getEvenlyDistributedQuestions(
    topicIds: number[], 
    count: number
  ): Promise<Question[]> {
    const questionsPerTopic = Math.floor(count / topicIds.length);
    const remainder = count % topicIds.length;
    
    const allQuestions: Question[] = [];
    
    for (let i = 0; i < topicIds.length; i++) {
      const topicId = topicIds[i];
      const questionsNeeded = questionsPerTopic + (i < remainder ? 1 : 0);
      
      const questions = await db<Question>('questions')
        .where({ topic_id: topicId })
        .orderByRaw('RANDOM()')
        .limit(questionsNeeded);
      
      allQuestions.push(...questions);
    }
    
    // Shuffle the final array to randomize question order
    return this.shuffleArray(allQuestions);
  }

  private static async getProportionallyDistributedQuestions(
    topicIds: number[], 
    count: number
  ): Promise<Question[]> {
    // Get question counts per topic
    const topicCounts = await db<Question>('questions')
      .select('topic_id')
      .count('* as question_count')
      .whereIn('topic_id', topicIds)
      .groupBy('topic_id');
    
    const totalAvailable = topicCounts.reduce((sum, topic) => 
      sum + Number(topic.question_count), 0
    );
    
    const allQuestions: Question[] = [];
    
    for (const topicCount of topicCounts) {
      const proportion = Number(topicCount.question_count) / totalAvailable;
      const questionsNeeded = Math.round(count * proportion);
      
      const questions = await db<Question>('questions')
        .where({ topic_id: topicCount.topic_id })
        .orderByRaw('RANDOM()')
        .limit(questionsNeeded);
      
      allQuestions.push(...questions);
    }
    
    return this.shuffleArray(allQuestions);
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static async getQuestionStats(): Promise<Record<string, any>> {
    const stats = await db<Question>('questions')
      .select(
        db.raw('COUNT(*) as total_questions'),
        db.raw('COUNT(CASE WHEN json_array_length(images) > 0 THEN 1 END) as questions_with_images'),
        db.raw('COUNT(CASE WHEN has_given_info = true THEN 1 END) as questions_with_given_info'),
        db.raw('COUNT(CASE WHEN question_multiline = true THEN 1 END) as multiline_questions')
      )
      .first();

    return stats || {};
  }

  static async validateData(): Promise<Record<string, any>> {
    const issues = await db<Question>('questions')
      .select('original_id')
      .whereRaw("json_array_length(choices) != 4")
      .orWhere('correct_answer', 'not in', ['A', 'B', 'C', 'D'])
      .orWhere('question_text', '');

    return {
      issueCount: issues.length,
      issues: issues.map(q => q.original_id)
    };
  }
}