import React from 'react';
import { Question } from '../hooks/useApi';

interface QuestionDisplayProps {
  question: Question;
  selectedAnswer?: string;
  onAnswerSelect?: (answer: string) => void;
  showCorrectAnswer?: boolean;
  showExplanation?: boolean;
  questionNumber: number;
  totalQuestions: number;
  disabled?: boolean;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  showCorrectAnswer = false,
  showExplanation = false,
  questionNumber,
  totalQuestions,
  disabled = false,
}) => {
  const formatText = (text: string) => {
    if (!text) return text;
    
    // Convert superscript patterns like ^2, ^3, etc.
    let formatted = text.replace(/\^(\d+)/g, '<sup>$1</sup>');
    
    // Convert subscript patterns like _2, _3, etc.
    formatted = formatted.replace(/_(\d+)/g, '<sub>$1</sub>');
    
    // Convert degree symbols
    formatted = formatted.replace(/°/g, '°');
    formatted = formatted.replace(/degrees?/gi, '°');
    
    // Convert common nuclear engineering symbols
    formatted = formatted.replace(/\bCO2\b/g, 'CO<sub>2</sub>');
    formatted = formatted.replace(/\bH2O\b/g, 'H<sub>2</sub>O');
    formatted = formatted.replace(/\bU235\b/g, 'U<sup>235</sup>');
    formatted = formatted.replace(/\bU238\b/g, 'U<sup>238</sup>');
    formatted = formatted.replace(/\bPu239\b/g, 'Pu<sup>239</sup>');
    
    return formatted;
  };

  const renderFormattedText = (text: string, className?: string) => {
    const formattedText = formatText(text);
    return (
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: formattedText }}
      />
    );
  };

  const getChoiceStatus = (choiceLetter: string) => {
    if (!showCorrectAnswer) {
      return selectedAnswer === choiceLetter ? 'selected' : 'default';
    }
    
    const isCorrect = choiceLetter === question.correctAnswer;
    const isSelected = selectedAnswer === choiceLetter;
    
    if (isCorrect && isSelected) return 'correct-selected';
    if (isCorrect) return 'correct';
    if (isSelected) return 'incorrect-selected';
    return 'default';
  };

  const getChoiceClasses = (status: string) => {
    const baseClasses = 'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 mb-3';
    
    switch (status) {
      case 'selected':
        return `${baseClasses} border-blue-500 bg-blue-50 text-blue-900`;
      case 'correct':
        return `${baseClasses} border-green-500 bg-green-50 text-green-900`;
      case 'correct-selected':
        return `${baseClasses} border-green-500 bg-green-100 text-green-900 ring-2 ring-green-500`;
      case 'incorrect-selected':
        return `${baseClasses} border-red-500 bg-red-50 text-red-900 ring-2 ring-red-500`;
      default:
        return `${baseClasses} border-gray-200 hover:border-gray-300 hover:bg-gray-50`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Question Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-sm text-gray-500">
            Topic: {question.topic.name}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Images */}
      {question.images && question.images.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.images.map((image, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={image.url}
                  alt={`Question ${question.id} - Image ${index + 1}`}
                  className="w-full h-auto object-contain bg-white"
                  style={{ maxHeight: '400px' }}
                />
                <div className="px-3 py-2 bg-gray-50 text-xs text-gray-600">
                  {image.filename} (Page {image.page})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Given Information */}
      {question.givenInformation && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-3">Given Information:</h4>
          
          {question.givenInformation.hasTable ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    {question.givenInformation.columns.map((column, index) => (
                      <th 
                        key={index} 
                        className="border border-gray-300 px-3 py-2 bg-gray-100 text-left font-medium"
                      >
                        {renderFormattedText(column, 'text-sm')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {question.givenInformation.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td 
                          key={cellIndex} 
                          className="border border-gray-300 px-3 py-2"
                        >
                          {renderFormattedText(cell, 'text-sm')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-2">
              {question.givenInformation.rawText.map((line, index) => (
                <div key={index}>
                  {renderFormattedText(line, 'text-sm text-blue-800')}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Question Stem */}
      <div className="mb-6">
        {renderFormattedText(
          question.questionStem.text, 
          'text-lg text-gray-900 leading-relaxed'
        )}
      </div>

      {/* Answer Choices */}
      <div className="space-y-3">
        {question.answerChoices.hasHeaders && (
          <div className="text-sm font-medium text-gray-700 mb-4">
            Answer Format: {question.answerChoices.format}
          </div>
        )}
        
        {question.answerChoices.choices.map((choice, index) => {
          const status = getChoiceStatus(choice.letter);
          
          return (
            <div
              key={choice.letter}
              onClick={() => !disabled && onAnswerSelect?.(choice.letter)}
              className={`${getChoiceClasses(status)} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    status === 'correct' || status === 'correct-selected' 
                      ? 'bg-green-500 text-white' 
                      : status === 'incorrect-selected'
                      ? 'bg-red-500 text-white'
                      : status === 'selected'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {choice.letter}
                  </div>
                </div>
                <div className="flex-1">
                  {renderFormattedText(choice.text, 'text-gray-900')}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Correct Answer Indication */}
      {showCorrectAnswer && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
            <span className="font-medium text-green-900">
              Correct Answer: {question.correctAnswer}
            </span>
          </div>
        </div>
      )}

      {/* Explanation */}
      {showExplanation && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Explanation:</h4>
          <p className="text-gray-700 text-sm">
            {/* TODO: Add explanation field to Question interface when available */}
            Detailed explanation for this question will be available when provided in the question data.
          </p>
        </div>
      )}
    </div>
  );
};