import { Request, Response } from 'express';
import { QuestionService, QuizGenerationRequest } from '../services/QuestionService';

export class QuestionController {
  static async getQuestions(req: Request, res: Response): Promise<void> {
    try {
      const {
        topics,
        hasImages,
        limit = 50,
        offset = 0,
        randomize = false
      } = req.query;

      const topicSlugs = topics ? 
        (Array.isArray(topics) ? topics : [topics]) as string[] : 
        undefined;

      const result = await QuestionService.getQuestions({
        topicSlugs,
        hasImages: hasImages === 'true' ? true : hasImages === 'false' ? false : undefined,
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10),
        randomize: randomize === 'true'
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch questions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getQuestionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const questionId = parseInt(id, 10);

      if (isNaN(questionId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid question ID',
          message: 'Question ID must be a number'
        });
        return;
      }

      const question = await QuestionService.getQuestionById(questionId);

      if (!question) {
        res.status(404).json({
          success: false,
          error: 'Question not found',
          message: `No question found with ID: ${questionId}`
        });
        return;
      }

      res.json({
        success: true,
        data: question
      });
    } catch (error) {
      console.error('Error fetching question:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch question',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async generateQuiz(req: Request, res: Response): Promise<void> {
    try {
      const {
        topicSlugs,
        questionCount,
        mode,
        distributionStrategy = 'even'
      }: QuizGenerationRequest = req.body;

      // Validation
      if (!Array.isArray(topicSlugs) || topicSlugs.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid request',
          message: 'topicSlugs must be a non-empty array'
        });
        return;
      }

      if (!questionCount || questionCount < 1 || questionCount > 1000) {
        res.status(400).json({
          success: false,
          error: 'Invalid request',
          message: 'questionCount must be between 1 and 1000'
        });
        return;
      }

      if (!['immediate', 'practice'].includes(mode)) {
        res.status(400).json({
          success: false,
          error: 'Invalid request',
          message: 'mode must be either "immediate" or "practice"'
        });
        return;
      }

      const result = await QuestionService.generateQuiz({
        topicSlugs,
        questionCount,
        mode,
        distributionStrategy
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error generating quiz:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate quiz',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getQuestionStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await QuestionService.getQuestionStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching question stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch question statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async validateQuestionData(req: Request, res: Response): Promise<void> {
    try {
      const validation = await QuestionService.validateQuestionData();
      
      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      console.error('Error validating question data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate question data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}