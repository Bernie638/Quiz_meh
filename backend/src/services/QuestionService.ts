import { QuestionModel, Question, QuestionWithTopic, QuestionFilter } from '../models/Question';
import { TopicService } from './TopicService';

export interface QuestionResponse {
  id: number;
  originalId: number;
  topic: {
    id: string;
    name: string;
  };
  page?: number;
  questionStem: {
    text: string;
    formatting: any;
    multiline: boolean;
  };
  givenInformation?: {
    hasTable: boolean;
    columns: string[];
    rows: string[][];
    rawText: string[];
  };
  answerChoices: {
    hasHeaders: boolean;
    format: string;
    choices: Array<{
      letter: string;
      text: string;
      formatting: any;
      multiline: boolean;
    }>;
  };
  correctAnswer: string;
  images: Array<{
    filename: string;
    page: number;
    position: string;
    url?: string;
  }>;
}

export interface QuizGenerationRequest {
  topicSlugs: string[];
  questionCount: number;
  mode: 'immediate' | 'practice';
  distributionStrategy?: 'even' | 'proportional';
}

export interface QuizGenerationResponse {
  questions: QuestionResponse[];
  distribution: Record<string, number>;
  total: number;
}

export class QuestionService {
  static async getQuestions(filter: {
    topicSlugs?: string[];
    hasImages?: boolean;
    limit?: number;
    offset?: number;
    randomize?: boolean;
  } = {}): Promise<{
    questions: QuestionResponse[];
    total: number;
  }> {
    let topicIds: number[] = [];
    
    if (filter.topicSlugs && filter.topicSlugs.length > 0) {
      const validation = await TopicService.validateTopicSlugs(filter.topicSlugs);
      topicIds = validation.topicIds;
    }

    const questionFilter: QuestionFilter = {
      topicIds: topicIds.length > 0 ? topicIds : undefined,
      hasImages: filter.hasImages,
      limit: filter.limit,
      offset: filter.offset,
      randomize: filter.randomize
    };

    const questions = await QuestionModel.findWithTopics(questionFilter);
    
    // Count total questions matching filter (without limit/offset)
    const countFilter = { ...questionFilter };
    delete countFilter.limit;
    delete countFilter.offset;
    const allQuestions = await QuestionModel.findWithTopics(countFilter);

    return {
      questions: questions.map(q => this.formatQuestionResponse(q)),
      total: allQuestions.length
    };
  }

  static async getQuestionById(id: number): Promise<QuestionResponse | null> {
    const question = await QuestionModel.findById(id);
    if (!question) return null;

    // Get topic information
    const topicService = new TopicService();
    // Need to implement a way to get topic by ID
    // For now, we'll use findWithTopics with a specific question
    const questionsWithTopic = await QuestionModel.findWithTopics({ 
      topicIds: [question.topic_id] 
    });
    
    const questionWithTopic = questionsWithTopic.find(q => q.id === id);
    if (!questionWithTopic) return null;

    return this.formatQuestionResponse(questionWithTopic);
  }

  static async generateQuiz(request: QuizGenerationRequest): Promise<QuizGenerationResponse> {
    // Validate topic slugs
    const validation = await TopicService.validateTopicSlugs(request.topicSlugs);
    
    if (validation.invalid.length > 0) {
      throw new Error(`Invalid topic slugs: ${validation.invalid.join(', ')}`);
    }

    const topicIds = validation.topicIds;
    
    // Get random questions with distribution
    const questions = await QuestionModel.getRandomQuestions(
      topicIds,
      request.questionCount,
      request.distributionStrategy || 'even'
    );

    // Get questions with topic information
    const questionIds = questions.map(q => q.id);
    const questionsWithTopics = await QuestionModel.findWithTopics({
      topicIds: topicIds
    });

    const selectedQuestions = questionsWithTopics.filter(q => 
      questionIds.includes(q.id)
    );

    // Calculate distribution
    const distribution: Record<string, number> = {};
    selectedQuestions.forEach(question => {
      const topicName = question.topic_name;
      distribution[topicName] = (distribution[topicName] || 0) + 1;
    });

    return {
      questions: selectedQuestions.map(q => this.formatQuestionResponse(q)),
      distribution,
      total: selectedQuestions.length
    };
  }

  static async getQuestionStats(): Promise<Record<string, any>> {
    return QuestionModel.getQuestionStats();
  }

  static async validateQuestionData(): Promise<Record<string, any>> {
    return QuestionModel.validateData();
  }

  private static formatQuestionResponse(question: QuestionWithTopic): QuestionResponse {
    return {
      id: question.id,
      originalId: question.original_id,
      topic: {
        id: question.topic_slug,
        name: question.topic_name
      },
      page: question.page_number,
      questionStem: {
        text: question.question_text,
        formatting: typeof question.question_formatting === 'string' 
          ? JSON.parse(question.question_formatting) 
          : question.question_formatting,
        multiline: question.question_multiline
      },
      givenInformation: question.has_given_info ? {
        hasTable: typeof question.given_info_table === 'string'
          ? JSON.parse(question.given_info_table).hasTable
          : question.given_info_table.hasTable,
        columns: typeof question.given_info_table === 'string'
          ? JSON.parse(question.given_info_table).columns
          : question.given_info_table.columns,
        rows: typeof question.given_info_table === 'string'
          ? JSON.parse(question.given_info_table).rows
          : question.given_info_table.rows,
        rawText: typeof question.given_info_raw === 'string'
          ? JSON.parse(question.given_info_raw)
          : question.given_info_raw
      } : undefined,
      answerChoices: {
        hasHeaders: false, // Can be enhanced later
        format: 'standard',
        choices: typeof question.choices === 'string'
          ? JSON.parse(question.choices)
          : question.choices
      },
      correctAnswer: question.correct_answer,
      images: (typeof question.images === 'string'
        ? JSON.parse(question.images)
        : question.images
      ).map((img: any) => ({
        ...img,
        url: `/api/images/${img.filename}` // API endpoint for serving images
      }))
    };
  }
}