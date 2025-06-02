import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Target, 
  Clock, 
  BookOpen, 
  TrendingUp, 
  RotateCcw,
  Home,
  CheckCircle,
  XCircle,
  Award
} from 'lucide-react';

interface QuizAnswer {
  questionId: number;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

interface QuizResultsProps {
  answers: QuizAnswer[];
  score: number;
  totalQuestions: number;
  timeSpent: number;
  topicBreakdown: Record<string, { correct: number; total: number }>;
  mode: 'immediate' | 'practice';
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  answers,
  score,
  totalQuestions,
  timeSpent,
  topicBreakdown,
  mode,
}) => {
  const navigate = useNavigate();
  
  const percentage = Math.round((score / totalQuestions) * 100);
  const averageTimePerQuestion = timeSpent / totalQuestions;
  
  const getPerformanceLevel = () => {
    if (percentage >= 90) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage >= 80) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (percentage >= 70) return { level: 'Satisfactory', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const performance = getPerformanceLevel();

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const handleRetakeQuiz = () => {
    // Clear stored quiz data and return to configuration
    localStorage.removeItem('currentQuiz');
    navigate('/config');
  };

  const handleNewQuiz = () => {
    navigate('/topics');
  };

  const handleReturnHome = () => {
    navigate('/');
  };

  const topicsSorted = Object.entries(topicBreakdown)
    .sort(([, a], [, b]) => (b.correct / b.total) - (a.correct / a.total));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Results Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            {percentage >= 80 ? (
              <Trophy className="w-16 h-16 text-yellow-500" />
            ) : percentage >= 70 ? (
              <Award className="w-16 h-16 text-blue-500" />
            ) : (
              <Target className="w-16 h-16 text-gray-500" />
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Complete!</h1>
          
          <div className={`inline-block px-6 py-3 rounded-full ${performance.bg} ${performance.color} font-semibold text-lg mb-6`}>
            {performance.level}
          </div>

          {/* Score Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{score}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
              <div className="text-xs text-gray-500">out of {totalQuestions}</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{percentage}%</div>
              <div className="text-sm text-gray-600">Score</div>
              <div className="text-xs text-gray-500">percentage correct</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">{formatTime(timeSpent)}</div>
              <div className="text-sm text-gray-600">Total Time</div>
              <div className="text-xs text-gray-500">avg {formatTime(averageTimePerQuestion)}/question</div>
            </div>
          </div>

          {/* Mode-specific message */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-gray-700">
              {mode === 'immediate' 
                ? 'You completed this quiz in immediate feedback mode, receiving explanations after each question.'
                : 'You completed this quiz in practice test mode, simulating exam conditions.'
              }
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={handleRetakeQuiz}
            className="btn-primary flex items-center"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Quiz
          </button>
          
          <button
            onClick={handleNewQuiz}
            className="btn-outline flex items-center"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            New Quiz
          </button>
          
          <button
            onClick={handleReturnHome}
            className="btn-secondary flex items-center"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </button>
        </div>
      </div>

      {/* Topic Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Performance by Topic
        </h2>
        
        <div className="space-y-4">
          {topicsSorted.map(([topicName, stats]) => {
            const topicPercentage = Math.round((stats.correct / stats.total) * 100);
            const isGood = topicPercentage >= 70;
            
            return (
              <div key={topicName} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{topicName}</h3>
                  <div className="flex items-center space-x-2">
                    {isGood ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className={`font-semibold ${isGood ? 'text-green-600' : 'text-red-600'}`}>
                      {topicPercentage}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>{stats.correct} correct out of {stats.total} questions</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isGood ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${topicPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-600" />
          Time Analysis
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {formatTime(Math.min(...answers.map(a => a.timeSpent)))}
            </div>
            <div className="text-sm text-gray-600">Fastest Answer</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {formatTime(Math.max(...answers.map(a => a.timeSpent)))}
            </div>
            <div className="text-sm text-gray-600">Slowest Answer</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {formatTime(averageTimePerQuestion)}
            </div>
            <div className="text-sm text-gray-600">Average Time</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h2>
        
        <div className="space-y-3">
          {percentage < 70 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                <strong>Focus on fundamentals:</strong> Consider reviewing the core concepts 
                before attempting another quiz. Your score suggests additional study time would be beneficial.
              </p>
            </div>
          )}
          
          {Object.entries(topicBreakdown).some(([, stats]) => (stats.correct / stats.total) < 0.6) && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                <strong>Topic-specific review:</strong> Focus extra attention on topics where you scored below 60%. 
                These areas need additional study.
              </p>
            </div>
          )}
          
          {percentage >= 80 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">
                <strong>Excellent work!</strong> You're demonstrating strong knowledge. 
                Consider taking quizzes with more challenging topic combinations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};