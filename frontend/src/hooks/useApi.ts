import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
  category: string;
  questionCount: number;
}

export interface Question {
  id: number;
  originalId: number;
  topic: {
    id: string;
    name: string;
  };
  page?: number;
  questionStem: {
    text: string;
    formatting: any;
    multiline: boolean;
  };
  givenInformation?: {
    hasTable: boolean;
    columns: string[];
    rows: string[][];
    rawText: string[];
  };
  answerChoices: {
    hasHeaders: boolean;
    format: string;
    choices: Array<{
      letter: string;
      text: string;
      formatting: any;
      multiline: boolean;
    }>;
  };
  correctAnswer: string;
  images: Array<{
    filename: string;
    page: number;
    position: string;
    url: string;
  }>;
}

export interface QuizGenerationRequest {
  topicSlugs: string[];
  questionCount: number;
  mode: 'immediate' | 'practice';
  distributionStrategy?: 'even' | 'proportional';
}

export interface QuizGenerationResponse {
  questions: Question[];
  distribution: Record<string, number>;
  total: number;
}

// Custom hook for API state management
export function useApiState<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return {
    data,
    loading,
    error,
    setData,
    setLoading,
    setError,
    reset,
  };
}

// Topics API
export function useTopics() {
  const { data, loading, error, setData, setLoading, setError } = useApiState<{
    topics: Topic[];
    summary?: {
      totalTopics: number;
      totalQuestions: number;
      categories: Record<string, number>;
    };
  }>();

  const fetchTopics = async (includeStats = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get<ApiResponse<any>>('/topics', {
        params: { includeStats }
      });
      
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError(response.data.error || 'Failed to fetch topics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch topics');
    } finally {
      setLoading(false);
    }
  };

  const validateTopics = async (slugs: string[]) => {
    try {
      const response = await api.post<ApiResponse<{
        valid: string[];
        invalid: string[];
        topicIds: number[];
      }>>('/topics/validate', { slugs });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to validate topics');
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to validate topics');
    }
  };

  return {
    topics: data?.topics || [],
    summary: data?.summary,
    loading,
    error,
    fetchTopics,
    validateTopics,
  };
}

// Questions API
export function useQuestions() {
  const { data, loading, error, setData, setLoading, setError } = useApiState<{
    questions: Question[];
    total: number;
  }>();

  const fetchQuestions = async (params: {
    topics?: string[];
    hasImages?: boolean;
    limit?: number;
    offset?: number;
    randomize?: boolean;
  } = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get<ApiResponse<{
        questions: Question[];
        total: number;
      }>>('/questions', { params });
      
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError(response.data.error || 'Failed to fetch questions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async (request: QuizGenerationRequest): Promise<QuizGenerationResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post<ApiResponse<QuizGenerationResponse>>(
        '/questions/generate-quiz',
        request
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to generate quiz');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate quiz';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const getQuestionById = async (id: number): Promise<Question> => {
    try {
      const response = await api.get<ApiResponse<Question>>(`/questions/${id}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch question');
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch question');
    }
  };

  return {
    questions: data?.questions || [],
    total: data?.total || 0,
    loading,
    error,
    fetchQuestions,
    generateQuiz,
    getQuestionById,
  };
}

// Health check
export function useHealthCheck() {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');
  const [details, setDetails] = useState<any>(null);

  const checkHealth = async () => {
    try {
      setStatus('checking');
      const response = await api.get('/health');
      setDetails(response.data);
      setStatus('healthy');
    } catch (err) {
      setStatus('unhealthy');
      setDetails({ error: err instanceof Error ? err.message : 'Health check failed' });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return {
    status,
    details,
    checkHealth,
  };
}

// Generic API hook for any endpoint
export function useApi<T>(endpoint: string, options: {
  autoFetch?: boolean;
  dependencies?: any[];
} = {}) {
  const { data, loading, error, setData, setLoading, setError, reset } = useApiState<T>();

  const fetchData = async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get<ApiResponse<T>>(endpoint, { params });
      
      if (response.data.success) {
        setData(response.data.data || null);
      } else {
        setError(response.data.error || 'API request failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API request failed');
    } finally {
      setLoading(false);
    }
  };

  const postData = async (body: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post<ApiResponse<T>>(endpoint, body);
      
      if (response.data.success) {
        setData(response.data.data || null);
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'API request failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'API request failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchData();
    }
  }, options.dependencies || []);

  return {
    data,
    loading,
    error,
    fetchData,
    postData,
    reset,
  };
}

export default api;