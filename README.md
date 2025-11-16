# 🤖 Resume Screener Bot with AI Models (OpenAI & Gemini)

A comprehensive AI-powered resume screening system that automates candidate evaluation using multiple AI models (OpenAI ChatGPT and Google Gemini) for intelligent analysis and scoring with advanced bias detection and fair screening capabilities.

![Resume Screener AI](https://img.shields.io/badge/AI-Powered-blue) ![React](https://img.shields.io/badge/React-18.2.0-61dafb) ![Flask](https://img.shields.io/badge/Flask-2.3.3-green) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.0-38bdf8)

## ✨ Features

### 🎯 **Core Functionality**
- **Resume Upload & Processing**: Support for PDF and DOCX formats with drag-and-drop interface
- **AI-Powered Analysis**: OpenAI ChatGPT and Google Gemini integration for intelligent candidate evaluation
- **Automated Scoring**: Relevance scores and categorization (Highly Qualified, Qualified, Not a Fit)
- **Interactive Dashboard**: Filter, sort, and view detailed candidate analysis with beautiful animations
- **HR Query Assistant**: AI chatbot for asking questions about candidates and getting insights
- **Candidate Chat**: Individual AI conversations about specific candidates

### 🛡️ **Bias Detection & Fair Screening**
- **Automated Bias Analysis**: Detects gender, age, location, and education bias in resumes
- **Blind Recruitment Mode**: Removes personal identifiers (names, emails, phones, addresses) for fair screening
- **Bias Scoring**: Comprehensive bias assessment with actionable recommendations
- **Fair Screening Toggle**: Option to analyze resumes with bias mitigation
- **Bias Mitigation Recommendations**: Specific suggestions to reduce bias in hiring process

### 🎨 **Modern UI/UX**
- **Beautiful Animations**: Smooth transitions and micro-interactions using Framer Motion
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Modern gradient backgrounds and glass morphism effects
- **Interactive Components**: Hover effects, loading states, and real-time feedback
- **Accessibility**: WCAG compliant with proper contrast ratios and keyboard navigation

## 🏗️ Architecture

### Backend (Flask)
- **File Processing**: PyPDF2 and python-docx for text extraction
- **AI Integration**: OpenAI ChatGPT and Google Gemini for resume analysis
- **Bias Detection**: Automated bias analysis and blind resume creation
- **Database**: SQLite for candidate data storage with comprehensive schema
- **REST API**: Full RESTful API with proper error handling and validation

### Frontend (React)
- **Modern React**: React 18 with hooks and functional components
- **State Management**: Context API and local state management
- **Styling**: TailwindCSS with custom animations and components
- **Routing**: React Router for seamless navigation
- **HTTP Client**: Axios with interceptors and error handling
- **UI Components**: Custom components with Framer Motion animations

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+** (for backend)
- **Node.js 14+** (for frontend)
- **OpenAI account** and API key (or Gemini API access)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd GenAi_resume_Bot
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env file and add your API keys
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Start the Application

```bash
# Terminal 1: Start backend server
cd backend
python app.py
# Backend runs on http://localhost:5000

# Terminal 2: Start frontend (if not already running)
cd frontend
npm start
# Frontend runs on http://localhost:3000
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# OpenAI Configuration (Primary)
OPENAI_API_KEY=your_openai_api_key_here

# Gemini Configuration (Alternative)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_ENDPOINT=https://your-gemini-endpoint.com/v1/chat/completions

# Application Configuration
FLASK_ENV=development
FLASK_DEBUG=True
DATABASE_URL=sqlite:///resume_screener.db
```

### API Keys Setup

#### OpenAI Setup (Recommended)
1. Visit [OpenAI Platform](https://platform.openai.com)
2. Create account and navigate to API Keys
3. Generate a new API key
4. Add to `.env` file as `OPENAI_API_KEY`

#### Gemini Setup (Alternative)
1. Obtain Gemini API key from your provider
2. Add to `.env` file as `GEMINI_API_KEY`
3. Configure the endpoint URL

## 📖 Usage Guide

### 1. **Upload Resumes**
- Navigate to "Upload Resume" in the navigation
- Drag and drop a PDF or DOCX file (or click to browse)
- Optionally add a job description for better matching
- Click "Upload & Analyze Resume"
- Watch the beautiful upload progress animation

### 2. **Dashboard Overview**
- View key statistics and metrics
- See recent candidates with quick actions
- Access all major features from the dashboard
- Beautiful cards with hover animations

### 3. **Candidate Management**
- Browse all candidates with advanced filtering
- Sort by score, name, experience, or upload date
- Search by name or skills
- Filter by qualification category
- View detailed candidate profiles

### 4. **AI Analysis**
- Comprehensive candidate evaluation
- Skills extraction and matching
- Experience level assessment
- Strengths and weaknesses analysis
- Hiring recommendations

### 5. **Bias Detection**
- Automatic bias analysis for all candidates
- View bias scores by category (gender, age, location, education)
- Access blind resume versions
- Get bias mitigation recommendations
- Toggle fair screening mode

### 6. **HR Assistant**
- Interactive AI chatbot for HR queries
- Ask questions like:
  - "Who are the top 5 candidates for Data Scientist role?"
  - "Show me candidates with Python and React skills"
  - "What's the average experience level?"
  - "Compare candidates for a senior developer position"

### 7. **Candidate Chat**
- Individual AI conversations about specific candidates
- Ask detailed questions about qualifications
- Get insights about cultural fit
- Explore specific skills and experience

## 🔌 API Endpoints

### Resume Management
- `POST /api/upload` - Upload and analyze resume
- `GET /api/candidates` - Get all candidates with filtering
- `GET /api/candidates/<id>` - Get specific candidate details

### Bias Detection & Fair Screening
- `GET /api/bias-analysis/<candidate_id>` - Get bias analysis
- `GET /api/blind-resume/<candidate_id>` - Get blind resume version
- `POST /api/fair-screening/toggle` - Toggle fair screening mode

### AI Chat & Assistance
- `POST /api/chat` - Chat about specific candidate
- `POST /api/hr-chat` - General HR queries and insights

### System & Analytics
- `GET /api/health` - Health check endpoint
- `GET /api/statistics` - Application statistics and metrics

## 🎨 UI Components & Animations

### Animation Features
- **Page Transitions**: Smooth slide animations between routes
- **Loading States**: Beautiful spinners and skeleton screens
- **Hover Effects**: Interactive button and card hover animations
- **Progress Indicators**: Animated upload progress and bias score meters
- **Micro-interactions**: Button clicks, form interactions, and feedback

### Design System
- **Color Palette**: Primary blues, success greens, warning oranges, danger reds
- **Typography**: Inter font family with proper font weights
- **Spacing**: Consistent spacing scale using Tailwind utilities
- **Shadows**: Layered shadow system for depth and hierarchy
- **Border Radius**: Consistent rounded corners throughout the app

## 🧪 Development

### Project Structure
```
resume-screener-bot/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables
│   ├── services/
│   │   ├── __init__.py        # Services module
│   │   ├── resume_parser.py   # PDF/DOCX text extraction
│   │   ├── openai_service.py  # AI model integration
│   │   ├── bias_detection.py  # Bias analysis engine
│   │   └── database.py        # Database operations
│   └── uploads/               # Resume file storage
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Layout/        # Navigation and layout
│   │   │   └── Upload/        # File upload components
│   │   ├── pages/             # Main application pages
│   │   │   ├── Dashboard.js   # Main dashboard
│   │   │   ├── Upload.js      # Resume upload page
│   │   │   ├── Candidates.js  # Candidate listing
│   │   │   ├── CandidateDetail.js # Individual candidate view
│   │   │   ├── HRAssistant.js # AI chat assistant
│   │   │   └── BiasAnalysis.js # Bias detection interface
│   │   ├── services/          # API and utilities
│   │   ├── config.js          # Application configuration
│   │   └── App.js             # Main React application
│   ├── public/                # Static assets
│   ├── package.json           # Node.js dependencies
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   └── postcss.config.js      # PostCSS configuration
└── README.md                  # This file
```

### Adding New Features

#### Backend Features
1. Add new endpoints in `app.py`
2. Create service functions in `services/`
3. Update database models if needed
4. Add proper error handling and validation

#### Frontend Features
1. Create new components in `components/`
2. Add new pages in `pages/`
3. Update routing in `App.js`
4. Add API calls using the service layer

### Code Style Guidelines
- **Python**: Follow PEP 8 standards
- **JavaScript**: Use ES6+ features and functional components
- **CSS**: Use Tailwind utility classes with custom CSS for complex animations
- **Comments**: Document complex logic and API integrations

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues
1. **OpenAI API Errors**
   - Verify API key in `.env` file
   - Check OpenAI service status
   - Ensure sufficient credits in OpenAI account
   - Check rate limits and usage quotas

2. **File Upload Issues**
   - Verify file size (max 16MB)
   - Check file format (PDF/DOCX only)
   - Ensure `uploads/` directory exists and is writable
   - Check disk space availability

3. **Database Issues**
   - Ensure SQLite is properly installed
   - Check database file permissions
   - Verify database initialization

#### Frontend Issues
1. **Connection Issues**
   - Verify backend server is running on port 5000
   - Check CORS settings in Flask app
   - Confirm API_BASE_URL in config.js

2. **Build Issues**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility
   - Verify all dependencies are installed

3. **Styling Issues**
   - Ensure Tailwind CSS is properly configured
   - Check PostCSS configuration
   - Verify all CSS imports

### Performance Optimization
- **Backend**: Implement caching for AI responses
- **Frontend**: Use React.memo for expensive components
- **Database**: Add indexes for frequently queried fields
- **Files**: Implement file compression for large uploads

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper testing
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request** with detailed description

### Development Guidelines
- Write comprehensive tests for new features
- Follow existing code style and patterns
- Update documentation for API changes
- Add proper error handling and validation
- Test across different browsers and devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing powerful language models
- **React Team** for the amazing frontend framework
- **Tailwind CSS** for the utility-first CSS framework
- **Framer Motion** for beautiful animations
- **Flask Team** for the lightweight web framework

## 📞 Support

For support and questions:
- 📧 Create an issue in the GitHub repository
- 📖 Check the troubleshooting section above
- 💬 Review the API documentation
- 🔍 Search existing issues for solutions

## 🚀 Future Enhancements

- [ ] **Multi-language Support**: Resume analysis in multiple languages
- [ ] **Advanced Analytics**: Detailed hiring metrics and trends
- [ ] **Bulk Processing**: Upload and analyze multiple resumes simultaneously
- [ ] **ATS Integration**: Connect with popular Applicant Tracking Systems
- [ ] **Custom Scoring**: Configurable scoring algorithms and criteria
- [ ] **Resume Comparison**: Side-by-side candidate comparisons
- [ ] **Export Features**: PDF reports and Excel exports
- [ ] **User Authentication**: Multi-user support with role-based access
- [ ] **Audit Logging**: Compliance tracking and decision history
- [ ] **Mobile App**: Native mobile applications for iOS and Android
- [ ] **Video Analysis**: AI-powered video interview analysis
- [ ] **Skills Assessment**: Integrated coding challenges and assessments

---

**Built with ❤️ using AI-powered technologies for fair and intelligent recruitment.**
