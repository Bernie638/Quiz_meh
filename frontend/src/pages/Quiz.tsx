import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { useQuestions, QuizGenerationRequest } from '../hooks/useApi';

interface QuizConfig {
  selectedTopics: string[];
  questionCount: number;
  mode: 'immediate' | 'practice';
  distributionStrategy: 'even' | 'proportional';
}

export const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const { generateQuiz, loading, error } = useQuestions();
  
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [quizGenerated, setQuizGenerated] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    // Get quiz configuration from localStorage
    const savedConfig = localStorage.getItem('quizConfig');
    const savedTopics = localStorage.getItem('selectedTopics');
    
    if (savedConfig && savedTopics) {
      try {
        const config = JSON.parse(savedConfig) as QuizConfig;
        const topics = JSON.parse(savedTopics) as string[];
        
        // Ensure topics are included in config
        config.selectedTopics = topics;
        setQuizConfig(config);
        
        // Generate the quiz
        generateQuizFromConfig(config);
      } catch (err) {
        console.error('Error loading quiz configuration:', err);
        setGenerationError('Failed to load quiz configuration');
      }
    } else {
      // No configuration found, redirect to topic selection
      navigate('/topics');
    }
  }, [navigate]);

  const generateQuizFromConfig = async (config: QuizConfig) => {
    try {
      setGenerationError(null);
      
      const request: QuizGenerationRequest = {
        topicSlugs: config.selectedTopics,
        questionCount: config.questionCount,
        mode: config.mode,
        distributionStrategy: config.distributionStrategy
      };

      const quizData = await generateQuiz(request);
      
      // Store generated quiz data
      localStorage.setItem('currentQuiz', JSON.stringify(quizData));
      setQuizGenerated(true);
      
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : 'Failed to generate quiz');
    }
  };

  const handleBackToConfig = () => {
    navigate('/config');
  };

  const handleStartQuiz = () => {
    // TODO: Navigate to actual quiz interface when implemented
    alert('Quiz interface coming soon! This will show the first question with proper formatting.');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Generating Your Quiz</h2>
            <p className="text-gray-600">
              Creating a customized quiz with {quizConfig?.questionCount} questions 
              from {quizConfig?.selectedTopics.length} topics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || generationError) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-900 mb-2">Quiz Generation Failed</h2>
            <p className="text-red-700 mb-6">{error || generationError}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleBackToConfig}
                className="btn-secondary flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Configuration
              </button>
              <button
                onClick={() => quizConfig && generateQuizFromConfig(quizConfig)}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizGenerated && quizConfig) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Ready!</h1>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quiz Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{quizConfig.questionCount}</div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{quizConfig.selectedTopics.length}</div>
                  <div className="text-sm text-gray-600">Topics</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600 capitalize">{quizConfig.mode}</div>
                  <div className="text-sm text-gray-600">Mode</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600 capitalize">{quizConfig.distributionStrategy}</div>
                  <div className="text-sm text-gray-600">Distribution</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Clock className="w-5 h-5" />
                <span>
                  Estimated time: {Math.ceil(quizConfig.questionCount * 1.5)} minutes
                </span>
              </div>
              
              {quizConfig.mode === 'practice' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    <strong>Practice Mode:</strong> You'll complete all questions without feedback. 
                    Results and explanations will be shown at the end.
                  </p>
                </div>
              )}
              
              {quizConfig.mode === 'immediate' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">
                    <strong>Immediate Feedback Mode:</strong> You'll get instant feedback 
                    after each question with explanations.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center space-x-4 mt-8">
              <button
                onClick={handleBackToConfig}
                className="btn-outline flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Configuration
              </button>
              <button
                onClick={handleStartQuiz}
                className="btn-primary flex items-center"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Loading quiz...</p>
      </div>
    </div>
  );
};