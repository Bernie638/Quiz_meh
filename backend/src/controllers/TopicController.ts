import { Request, Response } from 'express';
import { TopicService } from '../services/TopicService';

export class TopicController {
  static async getTopics(req: Request, res: Response): Promise<void> {
    try {
      const includeStats = req.query.includeStats === 'true';
      
      if (includeStats) {
        const result = await TopicService.getTopicsWithStats();
        res.json({
          success: true,
          data: result
        });
      } else {
        const topics = await TopicService.getAllTopics();
        res.json({
          success: true,
          data: {
            topics,
            total: topics.length
          }
        });
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch topics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getTopicBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const topic = await TopicService.getTopicBySlug(slug);
      
      if (!topic) {
        res.status(404).json({
          success: false,
          error: 'Topic not found',
          message: `No topic found with slug: ${slug}`
        });
        return;
      }

      res.json({
        success: true,
        data: topic
      });
    } catch (error) {
      console.error('Error fetching topic:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch topic',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async validateTopics(req: Request, res: Response): Promise<void> {
    try {
      const { slugs } = req.body;
      
      if (!Array.isArray(slugs)) {
        res.status(400).json({
          success: false,
          error: 'Invalid request',
          message: 'slugs must be an array'
        });
        return;
      }

      const validation = await TopicService.validateTopicSlugs(slugs);
      
      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      console.error('Error validating topics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate topics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}