const config = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  
  // File upload settings
  MAX_FILE_SIZE: 16 * 1024 * 1024, // 16MB
  ALLOWED_FILE_TYPES: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_EXTENSIONS: ['.pdf', '.docx'],
  
  // UI settings
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  
  // Scoring thresholds
  SCORE_THRESHOLDS: {
    HIGHLY_QUALIFIED: 80,
    QUALIFIED: 60,
    NOT_FIT: 0
  },
  
  // Bias detection thresholds
  BIAS_THRESHOLDS: {
    HIGH: 70,
    MEDIUM: 40,
    LOW: 0
  },
  
  // Categories
  CANDIDATE_CATEGORIES: [
    'Highly Qualified',
    'Qualified', 
    'Not a Fit'
  ],
  
  // Experience levels
  EXPERIENCE_LEVELS: [
    'Junior',
    'Mid-level',
    'Senior',
    'Expert'
  ],
  
  // Bias categories
  BIAS_CATEGORIES: [
    'gender',
    'age',
    'location',
    'education'
  ]
};

export default config;
