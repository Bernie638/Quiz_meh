import { Router } from 'express';
import topicRoutes from './topics';
import questionRoutes from './questions';

const router = Router();

// API routes
router.use('/topics', topicRoutes);
router.use('/questions', questionRoutes);

// API documentation endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Nuclear Quiz API',
    version: '1.0.0',
    endpoints: {
      topics: {
        'GET /api/topics': 'Get all topics',
        'GET /api/topics/:slug': 'Get topic by slug',
        'POST /api/topics/validate': 'Validate topic slugs'
      },
      questions: {
        'GET /api/questions': 'Get questions with filtering',
        'GET /api/questions/:id': 'Get question by ID',
        'POST /api/questions/generate-quiz': 'Generate quiz',
        'GET /api/questions/stats': 'Get question statistics',
        'GET /api/questions/validate': 'Validate question data'
      }
    },
    documentation: 'https://github.com/Bernie638/Quiz_meh#api-documentation'
  });
});

export default router;