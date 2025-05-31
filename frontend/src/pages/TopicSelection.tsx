import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Users, BookOpen } from 'lucide-react';
import { Topic } from '../types/quiz';

// Mock data - will be replaced with API call
const mockTopics: Topic[] = [
  { id: 'basic-energy', name: 'Basic Energy Concepts', questionCount: 2 },
  { id: 'breakers-relays', name: 'Bkrs, Rlys, and Disconnects', questionCount: 119 },
  { id: 'control-rods', name: 'Control Rods', questionCount: 37 },
  { id: 'controllers', name: 'Controllers and Positioners', questionCount: 112 },
  { id: 'thermal-limits', name: 'Core Thermal Limits', questionCount: 19 },
  { id: 'demins', name: 'Demins and Ion Exchange', questionCount: 37 },
  { id: 'fluid-dynamics', name: 'Fluid Statics and Dynamics', questionCount: 73 },
  { id: 'heat-exchangers', name: 'Heat Exchangers', questionCount: 61 },
  { id: 'heat-transfer', name: 'Heat Transfer', questionCount: 12 },
  { id: 'motors-generators', name: 'Motors and Generators', questionCount: 105 },
  { id: 'neutron-cycle', name: 'Neutron Life Cycle', questionCount: 31 },
  { id: 'neutrons', name: 'Neutrons', questionCount: 20 },
  { id: 'pumps', name: 'Pumps', questionCount: 174 },
  { id: 'reactivity', name: 'Reactivity Coefficients', questionCount: 23 },
  { id: 'kinetics', name: 'Reactor Kinetics and Neutron Sources', questionCount: 66 },
  { id: 'operational-physics', name: 'Reactor Operational Physics', questionCount: 97 },
  { id: 'sensors', name: 'Sensors and Detectors', questionCount: 172 },
  { id: 'thermal-hydraulics', name: 'Thermal Hydraulics', questionCount: 28 },
  { id: 'thermo-cycles', name: 'Thermodynamic Cycles', questionCount: 3 },
  { id: 'thermo-processes', name: 'Thermodynamic Processes', questionCount: 2 },
  { id: 'thermo-units', name: 'Thermodynamic Units and Properties', questionCount: 24 },
  { id: 'valves', name: 'Valves', questionCount: 102 },
];

export const TopicSelection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    // TODO: Replace with actual API call
    setTopics(mockTopics);
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
    
    // Store selected topics in localStorage for now
    localStorage.setItem('selectedTopics', JSON.stringify(Array.from(selectedTopics)));
    navigate('/config');
  };

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
                  <p className="text-xs text-gray-500">
                    {topic.questionCount} question{topic.questionCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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