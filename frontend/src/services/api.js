import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error('Unauthorized access');
    } else if (error.response?.status === 500) {
      // Handle server errors
      console.error('Server error');
    }
    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Health check
  healthCheck: () => api.get('/health'),

  // Resume upload and analysis
  uploadResume: (formData) => {
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Candidates
  getCandidates: () => api.get('/candidates'),
  getCandidate: (id) => api.get(`/candidates/${id}`),

  // Bias analysis
  getBiasAnalysis: (candidateId) => api.get(`/bias-analysis/${candidateId}`),
  getBlindResume: (candidateId) => api.get(`/blind-resume/${candidateId}`),

  // Chat
  chatWithCandidate: (candidateId, message) => 
    api.post('/chat', { candidate_id: candidateId, message }),
  
  hrChat: (message) => 
    api.post('/hr-chat', { message }),

  // Fair screening
  toggleFairScreening: (enabled) => 
    api.post('/fair-screening/toggle', { enabled }),

  // Statistics
  getStatistics: () => api.get('/statistics'),

  // Collaboration & Email
  sendTeamInvitation: (data) => 
    api.post('/collaboration/invite', data),
  
  sendNotification: (data) => 
    api.post('/collaboration/notify', data),

  // Advanced AI Features
  getInterviewQuestions: (candidateId) => 
    api.get(`/interview-questions/${candidateId}`),

  compareCandidates: (candidateIds, jobDescription) => 
    api.post('/compare-candidates', { candidate_ids: candidateIds, job_description: jobDescription }),
};

export default api;
