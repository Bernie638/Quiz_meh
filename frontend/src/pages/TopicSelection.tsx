import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Users, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { useTopics, Topic } from '../hooks/useApi';

export const TopicSelection: React.FC = () => {
  const navigate = useNavigate();
  const { topics, loading, error, fetchTopics } = useTopics();
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTopics(true); // Fetch topics with statistics
  }, []);

  const handleTopicToggle = (topicId: string) => {
    const newSelected = new Set(selectedTopics);
    if (newSelected.has(topicId)) {
      newSelected.delete(topicId);
    } else {
      newSelected.add(topicId);
    }
    setSelectedTopics(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedTopics(new Set(topics.map(topic => topic.id)));
  };

  const handleDeselectAll = () => {
    setSelectedTopics(new Set());
  };

  const selectedTopicsCount = selectedTopics.size;
  const totalQuestions = topics
    .filter(topic => selectedTopics.has(topic.id))
    .reduce((sum, topic) => sum + topic.questionCount, 0);

  const handleContinue = () => {
    if (selectedTopicsCount === 0) return;
    
    // Store selected topics in localStorage for the config page
    localStorage.setItem('selectedTopics', JSON.stringify(Array.from(selectedTopics)));
    navigate('/config');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading nuclear engineering topics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">Failed to Load Topics</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button
                onClick={() => fetchTopics(true)}
                className="mt-3 btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Select Quiz Topics
        </h1>
        <p className="text-lg text-gray-600">
          Choose the nuclear engineering topics you want to include in your quiz.
          You can select one or more topics to customize your practice session.
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Topics Selected</span>
              <span className="text-lg font-bold text-blue-600">{selectedTopicsCount}</span>
              <span className="text-sm text-gray-500">of {topics.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Total Questions</span>
              <span className="text-lg font-bold text-green-600">{totalQuestions}</span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleSelectAll}
              disabled={topics.length === 0}
              className="btn-outline text-sm"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="btn-secondary text-sm"
            >
              Deselect All
            </button>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      {topics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {topics.map((topic) => {
            const isSelected = selectedTopics.has(topic.id);
            return (
              <div
                key={topic.id}
                onClick={() => handleTopicToggle(topic.id)}
                className={`topic-checkbox ${isSelected ? 'selected' : ''}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      {topic.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-1">
                      {topic.questionCount} question{topic.questionCount !== 1 ? 's' : ''}
                    </p>
                    {topic.category && (
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {topic.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No topics available</p>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-center">
        <button
          onClick={handleContinue}
          disabled={selectedTopicsCount === 0}
          className={`px-8 py-3 rounded-lg font-medium transition-colors ${
            selectedTopicsCount === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'btn-primary'
          }`}
        >
          Continue to Quiz Configuration
        </button>
      </div>

      {selectedTopicsCount === 0 && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Please select at least one topic to continue
        </p>
      )}
    </div>
  );
};