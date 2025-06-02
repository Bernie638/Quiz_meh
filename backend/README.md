# Nuclear Quiz Backend

Node.js + Express + TypeScript backend for the Nuclear Exam Quiz application.

## Features

- ✅ **1,319 Nuclear Engineering Questions** loaded from extracted PDF data
- ✅ **22 Topics** with proper categorization
- ✅ **PostgreSQL Database** with comprehensive schema
- ✅ **RESTful API** with TypeScript
- ✅ **Question Distribution Algorithm** for quiz generation
- ✅ **Image Serving** for diagram-based questions
- ✅ **Data Validation** and integrity checks

## Quick Start

```bash
# Install dependencies
cd backend
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database configuration

# Set up database
npm run db:setup

# Start development server
npm run dev
```

## Database Setup

### Prerequisites
- PostgreSQL 12+ installed and running
- Database user with CREATE DATABASE permissions

### Configuration

1. **Create database and user:**
   ```sql
   CREATE DATABASE nuclear_quiz_dev;
   CREATE USER nuclear_quiz_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE nuclear_quiz_dev TO nuclear_quiz_user;
   ```

2. **Update .env file:**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=nuclear_quiz_dev
   DB_USER=nuclear_quiz_user
   DB_PASSWORD=your_password
   ```

3. **Run migrations and seeds:**
   ```bash
   npm run db:setup
   ```

### Database Schema

#### Topics Table
- **22 nuclear engineering topics** with metadata
- Categories: reactor-physics, mechanical, electrical, etc.
- Question counts per topic

#### Questions Table
- **1,319 questions** with complete formatting data
- JSON fields for formatting, choices, images
- Foreign key relationships to topics
- Original PDF page references

#### Quiz Sessions Table
- Active quiz tracking
- Question selection and ordering
- User answers and scoring
- Timing information

#### Quiz History Table
- Completed quiz records
- Performance analytics
- Topic-specific scoring

#### User Stats Table
- Aggregate user performance
- Learning progress tracking
- Preference storage

## API Endpoints

### Topics
- `GET /api/topics` - Get all topics
- `GET /api/topics/:slug` - Get topic by slug
- `POST /api/topics/validate` - Validate topic slugs

### Questions
- `GET /api/questions` - Get questions with filtering
- `GET /api/questions/:id` - Get question by ID
- `POST /api/questions/generate-quiz` - Generate quiz
- `GET /api/questions/stats` - Question statistics
- `GET /api/questions/validate` - Data validation

### Images
- `GET /api/images/:filename` - Serve question images

### Health Checks
- `GET /health` - Application health
- `GET /health/db` - Database connectivity

## Quiz Generation

The quiz generation algorithm supports two distribution strategies:

### Even Distribution
```typescript
// Distributes questions evenly across selected topics
// 50 questions across 22 topics = 2-3 questions per topic
const quiz = await QuestionService.generateQuiz({
  topicSlugs: ['valves', 'pumps', 'sensors'],
  questionCount: 50,
  mode: 'practice',
  distributionStrategy: 'even'
});
```

### Proportional Distribution
```typescript
// Distributes questions proportionally to topic size
// Topics with more questions get more quiz questions
const quiz = await QuestionService.generateQuiz({
  topicSlugs: ['valves', 'pumps', 'sensors'],
  questionCount: 50,
  mode: 'immediate',
  distributionStrategy: 'proportional'
});
```

## Data Format

### Question Response
```typescript
interface QuestionResponse {
  id: number;
  originalId: number; // 1000+ from PDF extraction
  topic: {
    id: string;
    name: string;
  };
  questionStem: {
    text: string;
    formatting: {
      superscript: FormattingRange[];
      subscript: FormattingRange[];
      special_chars: SpecialChar[];
    };
    multiline: boolean;
  };
  givenInformation?: {
    hasTable: boolean;
    columns: string[];
    rows: string[][];
    rawText: string[];
  };
  answerChoices: {
    choices: Choice[];
  };
  correctAnswer: string; // A, B, C, or D
  images: QuestionImage[];
}
```

## Development

### Scripts
- `npm run dev` - Development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run type-check` - TypeScript type checking

### Database Management
- `npm run db:migrate` - Run migrations
- `npm run db:rollback` - Rollback migrations
- `npm run db:seed` - Run seeds
- `npm run db:reset` - Reset database

### Data Validation
```bash
# Check question data integrity
curl http://localhost:3001/api/questions/validate

# Get question statistics
curl http://localhost:3001/api/questions/stats
```

## Production Deployment

### Azure Configuration
```env
# Production database
DATABASE_URL=postgresql://username:password@hostname:5432/database_name

# Azure Blob Storage for images
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
AZURE_STORAGE_CONTAINER_NAME=question-images
```

### Environment Variables
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://your-frontend-domain.com
```

## Performance

- **Batch inserts** for 1,319 questions (500 per batch)
- **Database indexing** on frequently queried fields
- **JSON field optimization** for complex data structures
- **Image serving** through Express static middleware
- **Connection pooling** for database connections

## Monitoring

### Health Checks
- Application health: `GET /health`
- Database health: `GET /health/db`
- API documentation: `GET /api`

### Logging
- Request logging with Morgan
- Error logging with stack traces in development
- Database query logging (optional)

## Troubleshooting

### Common Issues

1. **Database connection fails:**
   ```bash
   # Check PostgreSQL is running
   sudo service postgresql status
   
   # Verify credentials
   psql -h localhost -U nuclear_quiz_user -d nuclear_quiz_dev
   ```

2. **Migration errors:**
   ```bash
   # Reset database
   npm run db:reset
   ```

3. **Missing question data:**
   ```bash
   # Verify data file exists
   ls -la data/questions.json
   
   # Re-run seeds
   npm run db:seed
   ```

4. **Image serving issues:**
   ```bash
   # Check image directory
   ls -la data/images/
   
   # Verify file permissions
   chmod 644 data/images/*
   ```