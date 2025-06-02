import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Users, Clock, Target, BookOpen, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useTopics } from '../hooks/useApi';

interface QuizConfig {
  selectedTopics: string[];
  questionCount: number;
  mode: 'immediate' | 'practice';
  distributionStrategy: 'even' | 'proportional';
}

interface TopicSummary {
  id: string;
  name: string;
  questionCount: number;
}

export const QuizConfig: React.FC = () => {
  const navigate = useNavigate();
  const { topics, loading: topicsLoading, error: topicsError, fetchTopics } = useTopics();
  
  const [config, setConfig] = useState<QuizConfig>({
    selectedTopics: [],
    questionCount: 50,
    mode: 'practice',
    distributionStrategy: 'even'
  });
  
  const [selectedTopicsData, setSelectedTopicsData] = useState<TopicSummary[]>([]);
  const [totalAvailableQuestions, setTotalAvailableQuestions] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get selected topics from localStorage (from TopicSelection page)
    const savedTopics = localStorage.getItem('selectedTopics');
    if (savedTopics) {
      const topicIds = JSON.parse(savedTopics) as string[];
      setConfig(prev => ({ ...prev, selectedTopics: topicIds }));
      
      // Fetch all topics first
      fetchTopics(true);
    } else {
      // No topics selected, redirect back to topic selection
      navigate('/topics');
    }
  }, [navigate, fetchTopics]);

  useEffect(() => {
    // Update selected topics data when topics are loaded
    if (topics.length > 0 && config.selectedTopics.length > 0) {
      const filteredTopics = topics.filter(topic => 
        config.selectedTopics.includes(topic.id)
      ).map(topic => ({
        id: topic.id,
        name: topic.name,
        questionCount: topic.questionCount
      }));
      
      setSelectedTopicsData(filteredTopics);
      setTotalAvailableQuestions(
        filteredTopics.reduce((sum, topic) => sum + topic.questionCount, 0)
      );
    }
  }, [topics, config.selectedTopics]);


  const handleQuestionCountChange = (count: number) => {
    setConfig(prev => ({ ...prev, questionCount: count }));
  };

  const handleModeChange = (mode: 'immediate' | 'practice') => {
    setConfig(prev => ({ ...prev, mode }));
  };

  const handleDistributionChange = (strategy: 'even' | 'proportional') => {
    setConfig(prev => ({ ...prev, distributionStrategy: strategy }));
  };

  const getQuestionDistribution = () => {
    if (selectedTopicsData.length === 0) return [];

    const { questionCount, distributionStrategy } = config;
    
    if (distributionStrategy === 'even') {
      const questionsPerTopic = Math.floor(questionCount / selectedTopicsData.length);
      const remainder = questionCount % selectedTopicsData.length;
      
      return selectedTopicsData.map((topic, index) => ({
        ...topic,
        allocatedQuestions: questionsPerTopic + (index < remainder ? 1 : 0)
      }));
    } else {
      // Proportional distribution
      const totalQuestions = selectedTopicsData.reduce((sum, topic) => 
        sum + topic.questionCount, 0
      );
      
      return selectedTopicsData.map(topic => {
        const proportion = topic.questionCount / totalQuestions;
        const allocated = Math.round(questionCount * proportion);
        return {
          ...topic,
          allocatedQuestions: Math.min(allocated, topic.questionCount)
        };
      });
    }
  };

  const canStartQuiz = () => {
    return config.selectedTopics.length > 0 && 
           config.questionCount > 0 && 
           config.questionCount <= totalAvailableQuestions;
  };

  const handleStartQuiz = async () => {
    if (!canStartQuiz()) return;

    try {
      setLoading(true);
      
      // Store config for the quiz
      localStorage.setItem('quizConfig', JSON.stringify(config));
      
      // Navigate to quiz
      navigate('/quiz');
    } catch (err) {
      setError('Failed to start quiz');
      console.error('Error starting quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const questionDistribution = getQuestionDistribution();
  const isLoading = topicsLoading || loading;
  const displayError = error || topicsError;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading quiz configuration...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
          <Settings className="w-8 h-8 mr-3 text-blue-600" />
          Quiz Configuration
        </h1>
        <p className="text-lg text-gray-600">
          Customize your quiz settings including question count, mode, and distribution strategy.
        </p>
      </div>

      {displayError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-700">{displayError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Selected Topics Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Selected Topics ({selectedTopicsData.length})
            </h3>
            
            {isLoading ? (
              <div className="text-gray-500">Loading topic details...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedTopicsData.map(topic => (
                  <div key={topic.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-gray-900">{topic.name}</span>
                    <span className="text-sm text-blue-600">{topic.questionCount} questions</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Total Available Questions:</span>
                <span className="text-lg font-bold text-green-600">{totalAvailableQuestions}</span>
              </div>
            </div>
          </div>

          {/* Question Count Configuration */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
              Number of Questions
            </h3>
            
            {/* Quick Select Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[10, 25, 50, 100].map(count => (
                <button
                  key={count}
                  onClick={() => handleQuestionCountChange(count)}
                  disabled={count > totalAvailableQuestions}
                  className={`p-3 rounded-lg font-medium transition-colors ${
                    config.questionCount === count
                      ? 'bg-blue-600 text-white'
                      : count > totalAvailableQuestions
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {count === 50 ? '50 (Standard)' : count}
                </button>
              ))}
            </div>

            {/* All Available Button */}
            <button
              onClick={() => handleQuestionCountChange(totalAvailableQuestions)}
              className={`w-full p-3 rounded-lg font-medium mb-4 transition-colors ${
                config.questionCount === totalAvailableQuestions
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              All Available ({totalAvailableQuestions} questions)
            </button>

            {/* Custom Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Custom Amount:
              </label>
              <input
                type="number"
                min="1"
                max={totalAvailableQuestions}
                value={config.questionCount}
                onChange={(e) => handleQuestionCountChange(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500">
                Maximum: {totalAvailableQuestions} questions
              </p>
            </div>
          </div>

          {/* Quiz Mode Configuration */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-600" />
              Quiz Mode
            </h3>
            
            <div className="space-y-4">
              <div
                onClick={() => handleModeChange('practice')}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  config.mode === 'practice'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start">
                  <div className={`w-5 h-5 rounded-full border-2 mt-0.5 mr-3 flex items-center justify-center ${
                    config.mode === 'practice' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {config.mode === 'practice' && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Practice Test Mode</h4>
                    <p className="text-sm text-gray-600">
                      Complete the entire quiz without feedback. See results and topic breakdown at the end.
                      Ideal for exam simulation.
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => handleModeChange('immediate')}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  config.mode === 'immediate'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start">
                  <div className={`w-5 h-5 rounded-full border-2 mt-0.5 mr-3 flex items-center justify-center ${
                    config.mode === 'immediate' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {config.mode === 'immediate' && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Immediate Feedback Mode</h4>
                    <p className="text-sm text-gray-600">
                      Get instant feedback after each question (Duolingo-style). 
                      Perfect for learning and understanding concepts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Distribution Strategy */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Question Distribution
            </h3>
            
            <div className="space-y-4">
              <div
                onClick={() => handleDistributionChange('even')}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  config.distributionStrategy === 'even'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start">
                  <div className={`w-5 h-5 rounded-full border-2 mt-0.5 mr-3 flex items-center justify-center ${
                    config.distributionStrategy === 'even' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {config.distributionStrategy === 'even' && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Even Distribution</h4>
                    <p className="text-sm text-gray-600">
                      Distribute questions evenly across selected topics. 
                      Each topic gets roughly the same number of questions.
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => handleDistributionChange('proportional')}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  config.distributionStrategy === 'proportional'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start">
                  <div className={`w-5 h-5 rounded-full border-2 mt-0.5 mr-3 flex items-center justify-center ${
                    config.distributionStrategy === 'proportional' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {config.distributionStrategy === 'proportional' && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Proportional Distribution</h4>
                    <p className="text-sm text-gray-600">
                      Distribute questions proportionally based on topic size. 
                      Topics with more questions get more quiz questions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Preview</h3>
            
            {/* Quiz Summary */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Questions:</span>
                <span className="font-medium">{config.questionCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Topics:</span>
                <span className="font-medium">{selectedTopicsData.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mode:</span>
                <span className="font-medium capitalize">{config.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distribution:</span>
                <span className="font-medium capitalize">{config.distributionStrategy}</span>
              </div>
            </div>

            {/* Question Distribution Preview */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Question Distribution:</h4>
              <div className="space-y-2">
                {questionDistribution.map(topic => (
                  <div key={topic.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate">{topic.name}</span>
                    <span className="font-medium ml-2">
                      {topic.allocatedQuestions}/{topic.questionCount}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Quiz Button */}
            <button
              onClick={handleStartQuiz}
              disabled={!canStartQuiz() || loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                canStartQuiz() && !loading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-5 h-5 mr-2" />
              )}
              Start Quiz
            </button>

            {!canStartQuiz() && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Please select valid configuration to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};