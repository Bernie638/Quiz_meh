import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionDisplay } from './QuestionDisplay';
import { Question } from '../hooks/useApi';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
 
  Trophy,
  Clock,
  ArrowLeft,
  Flag
} from 'lucide-react';

interface QuizAnswer {
  questionId: number;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

interface QuizState {
  currentQuestionIndex: number;
  answers: Record<number, QuizAnswer>;
  startTime: number;
  totalTimeSpent: number;
  isCompleted: boolean;
}

interface QuizInterfaceProps {
  questions: Question[];
  mode: 'immediate' | 'practice';
  onQuizComplete: (results: {
    answers: QuizAnswer[];
    score: number;
    totalQuestions: number;
    timeSpent: number;
    topicBreakdown: Record<string, { correct: number; total: number }>;
  }) => void;
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({
  questions,
  mode,
  onQuizComplete,
}) => {
  const navigate = useNavigate();
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    startTime: Date.now(),
    totalTimeSpent: 0,
    isCompleted: false,
  });
  
  const [showFeedback, setShowFeedback] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [currentAnswer, setCurrentAnswer] = useState<string>('');

  const currentQuestion = questions[quizState.currentQuestionIndex];
  const isLastQuestion = quizState.currentQuestionIndex === questions.length - 1;
  const answeredCurrentQuestion = currentQuestion && quizState.answers[currentQuestion.id];

  useEffect(() => {
    // Reset question timer when question changes
    setQuestionStartTime(Date.now());
    setCurrentAnswer('');
    setShowFeedback(false);
  }, [quizState.currentQuestionIndex]);

  const handleAnswerSelect = (selectedAnswer: string) => {
    if (quizState.isCompleted || (mode === 'immediate' && showFeedback)) {
      return;
    }

    setCurrentAnswer(selectedAnswer);

    if (mode === 'immediate') {
      // In immediate mode, show feedback right away
      handleSubmitAnswer(selectedAnswer);
    }
  };

  const handleSubmitAnswer = (selectedAnswer?: string) => {
    if (!currentQuestion) return;

    const answer = selectedAnswer || currentAnswer;
    if (!answer) return;

    const timeSpent = Date.now() - questionStartTime;
    const isCorrect = answer === currentQuestion.correctAnswer;

    const answerRecord: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: answer,
      isCorrect,
      timeSpent,
    };

    setQuizState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQuestion.id]: answerRecord,
      },
      totalTimeSpent: prev.totalTimeSpent + timeSpent,
    }));

    if (mode === 'immediate') {
      setShowFeedback(true);
    }
  };

  const handleNextQuestion = () => {
    if (mode === 'practice' && !answeredCurrentQuestion && currentAnswer) {
      handleSubmitAnswer();
    }

    if (isLastQuestion) {
      completeQuiz();
    } else {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    }
  };

  const handlePreviousQuestion = () => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }));
    }
  };

  const completeQuiz = () => {
    const answers = Object.values(quizState.answers);
    const score = answers.filter(a => a.isCorrect).length;
    const totalTime = Date.now() - quizState.startTime;
    
    // Calculate topic breakdown
    const topicBreakdown: Record<string, { correct: number; total: number }> = {};
    
    questions.forEach(question => {
      const topicName = question.topic.name;
      if (!topicBreakdown[topicName]) {
        topicBreakdown[topicName] = { correct: 0, total: 0 };
      }
      topicBreakdown[topicName].total++;
      
      const answer = quizState.answers[question.id];
      if (answer && answer.isCorrect) {
        topicBreakdown[topicName].correct++;
      }
    });

    setQuizState(prev => ({ ...prev, isCompleted: true }));

    onQuizComplete({
      answers,
      score,
      totalQuestions: questions.length,
      timeSpent: totalTime,
      topicBreakdown,
    });
  };

  const handleReturnToMenu = () => {
    navigate('/topics');
  };

  const getProgressPercentage = () => {
    return ((quizState.currentQuestionIndex + 1) / questions.length) * 100;
  };

  const getAnsweredCount = () => {
    return Object.keys(quizState.answers).length;
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (quizState.isCompleted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Completed!</h1>
          <p className="text-lg text-gray-600 mb-8">
            You've finished the quiz. Results will be shown on the next page.
          </p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-500">Loading question...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Quiz Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleReturnToMenu}
            className="btn-outline flex items-center text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit Quiz
          </button>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Flag className="w-4 h-4" />
              <span>{getAnsweredCount()} / {questions.length} answered</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{formatTime(Date.now() - quizState.startTime)}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Question Display */}
      <QuestionDisplay
        question={currentQuestion}
        selectedAnswer={answeredCurrentQuestion?.selectedAnswer || currentAnswer}
        onAnswerSelect={handleAnswerSelect}
        showCorrectAnswer={mode === 'immediate' && showFeedback}
        showExplanation={mode === 'immediate' && showFeedback}
        questionNumber={quizState.currentQuestionIndex + 1}
        totalQuestions={questions.length}
        disabled={mode === 'immediate' && showFeedback}
      />

      {/* Navigation Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePreviousQuestion}
              disabled={quizState.currentQuestionIndex === 0}
              className={`btn-outline flex items-center ${
                quizState.currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </button>
          </div>

          {/* Mode-specific controls */}
          <div className="flex items-center space-x-3">
            {mode === 'practice' && (
              <button
                onClick={() => handleSubmitAnswer()}
                disabled={!currentAnswer || !!answeredCurrentQuestion}
                className={`btn-secondary ${
                  !currentAnswer || !!answeredCurrentQuestion ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {answeredCurrentQuestion ? 'Answered' : 'Submit Answer'}
              </button>
            )}

            {mode === 'immediate' && showFeedback && (
              <div className="flex items-center space-x-2">
                {answeredCurrentQuestion?.isCorrect ? (
                  <div className="flex items-center text-green-600">
                    <Check className="w-5 h-5 mr-2" />
                    <span className="font-medium">Correct!</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <X className="w-5 h-5 mr-2" />
                    <span className="font-medium">Incorrect</span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleNextQuestion}
              disabled={
                mode === 'practice' 
                  ? !currentAnswer && !answeredCurrentQuestion
                  : mode === 'immediate' && !showFeedback
              }
              className={`btn-primary flex items-center ${
                (mode === 'practice' && !currentAnswer && !answeredCurrentQuestion) ||
                (mode === 'immediate' && !showFeedback)
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
            >
              {isLastQuestion ? (
                <>
                  Complete Quiz
                  <Check className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};