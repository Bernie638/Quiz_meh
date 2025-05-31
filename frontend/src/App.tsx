import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TopicSelection } from './pages/TopicSelection';
import { QuizConfig } from './pages/QuizConfig';
import { Quiz } from './pages/Quiz';
import { Results } from './pages/Results';
import { History } from './pages/History';
import { Navigation } from './components/Navigation';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container-quiz py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/topics" replace />} />
            <Route path="/topics" element={<TopicSelection />} />
            <Route path="/config" element={<QuizConfig />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/results" element={<Results />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;