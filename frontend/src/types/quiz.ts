export interface Question {
  id: number;
  topic: string;
  page: number;
  questionStem: {
    text: string;
    formatting: TextFormatting;
    multiline: boolean;
  };
  givenInformation: {
    hasTable: boolean;
    columns: string[];
    rows: string[][];
    rawText: string[];
  };
  answerChoices: {
    hasHeaders: boolean;
    format: string;
    choices: Choice[];
  };
  correctAnswer: string;
  images: QuestionImage[];
  rawContent?: string[];
}

export interface Choice {
  letter: string;
  text: string;
  formatting: TextFormatting;
  multiline: boolean;
}

export interface QuestionImage {
  filename: string;
  page: number;
  position: string;
}

export interface TextFormatting {
  superscript: FormattingRange[];
  subscript: FormattingRange[];
  bold: FormattingRange[];
  italic: FormattingRange[];
  special_chars: SpecialChar[];
}

export interface FormattingRange {
  start: number;
  end: number;
  text?: string;
}

export interface SpecialChar {
  position: number;
  char: string;
}

export interface Topic {
  id: string;
  name: string;
  questionCount: number;
}

export interface QuizConfig {
  selectedTopics: string[];
  questionCount: number;
  mode: 'immediate' | 'practice';
}

export interface QuizSession {
  id: string;
  config: QuizConfig;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<number, string>;
  score: number;
  startTime: Date;
  endTime?: Date;
  topicScores: Record<string, TopicScore>;
}

export interface TopicScore {
  topic: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface QuizHistory {
  id: string;
  date: Date;
  mode: 'immediate' | 'practice';
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  topics: string[];
  topicScores: Record<string, TopicScore>;
  timeSpent: number; // in seconds
}

export interface UserStats {
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  topicPerformance: Record<string, {
    attempted: number;
    averageScore: number;
    bestScore: number;
    lastAttempted: Date;
  }>;
  recentHistory: QuizHistory[];
}