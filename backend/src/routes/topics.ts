import { Router } from 'express';
import { TopicController } from '../controllers/TopicController';

const router = Router();

/**
 * @route GET /api/topics
 * @desc Get all topics
 * @query includeStats - Include statistics (optional)
 */
router.get('/', TopicController.getTopics);

/**
 * @route GET /api/topics/:slug
 * @desc Get topic by slug
 * @param slug - Topic slug
 */
router.get('/:slug', TopicController.getTopicBySlug);

/**
 * @route POST /api/topics/validate
 * @desc Validate topic slugs
 * @body slugs - Array of topic slugs to validate
 */
router.post('/validate', TopicController.validateTopics);

export default router;