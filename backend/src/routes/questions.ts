import { Router } from 'express';
import { QuestionController } from '../controllers/QuestionController';

const router = Router();

/**
 * @route GET /api/questions
 * @desc Get questions with optional filtering
 * @query topics - Topic slugs (comma-separated or multiple)
 * @query hasImages - Filter by image presence (true/false)
 * @query limit - Number of questions to return (default: 50)
 * @query offset - Number of questions to skip (default: 0)
 * @query randomize - Randomize question order (default: false)
 */
router.get('/', QuestionController.getQuestions);

/**
 * @route GET /api/questions/stats
 * @desc Get question statistics
 */
router.get('/stats', QuestionController.getQuestionStats);

/**
 * @route GET /api/questions/validate
 * @desc Validate question data integrity
 */
router.get('/validate', QuestionController.validateQuestionData);

/**
 * @route GET /api/questions/:id
 * @desc Get question by ID
 * @param id - Question ID
 */
router.get('/:id', QuestionController.getQuestionById);

/**
 * @route POST /api/questions/generate-quiz
 * @desc Generate a quiz with specified parameters
 * @body topicSlugs - Array of topic slugs
 * @body questionCount - Number of questions
 * @body mode - Quiz mode ('immediate' or 'practice')
 * @body distributionStrategy - How to distribute questions ('even' or 'proportional')
 */
router.post('/generate-quiz', QuestionController.generateQuiz);

export default router;