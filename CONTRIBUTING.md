# Contributing to Resume Screener AI

Thank you for your interest in contributing to Resume Screener AI! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues
- Use the GitHub issue tracker to report bugs
- Include detailed steps to reproduce the issue
- Provide system information (OS, Python version, Node.js version)
- Include error messages and logs when applicable

### Suggesting Features
- Open an issue with the "enhancement" label
- Describe the feature and its use case
- Explain how it would benefit users
- Consider backward compatibility

### Code Contributions

#### Getting Started
1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/resume-screener-ai.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Set up the development environment using `python setup.py`

#### Development Guidelines

##### Backend (Python/Flask)
- Follow PEP 8 style guidelines
- Use type hints where appropriate
- Write docstrings for functions and classes
- Add unit tests for new functionality
- Use virtual environments for dependency management

##### Frontend (React/JavaScript)
- Use functional components with hooks
- Follow ESLint configuration
- Use meaningful component and variable names
- Implement proper error handling
- Add PropTypes or TypeScript for type checking

##### Database
- Use migrations for schema changes
- Include proper indexes for performance
- Follow naming conventions for tables and columns
- Document any complex queries

#### Code Style

##### Python
```python
def analyze_resume(resume_text: str, job_description: str = "") -> dict:
    """
    Analyze a resume using AI models.
    
    Args:
        resume_text: The extracted text from the resume
        job_description: Optional job description for better matching
        
    Returns:
        Dictionary containing analysis results
    """
    # Implementation here
    pass
```

##### JavaScript/React
```javascript
const CandidateCard = ({ candidate, onSelect }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = useCallback(() => {
    setIsLoading(true);
    onSelect(candidate.id);
  }, [candidate.id, onSelect]);
  
  return (
    <div className="card" onClick={handleClick}>
      {/* Component JSX */}
    </div>
  );
};
```

#### Testing
- Write unit tests for new functions
- Test API endpoints with different inputs
- Verify UI components render correctly
- Test error handling scenarios
- Include integration tests for critical paths

#### Documentation
- Update README.md for new features
- Add inline comments for complex logic
- Update API documentation
- Include examples in docstrings

### Pull Request Process

1. **Before Submitting**
   - Ensure all tests pass
   - Update documentation
   - Follow the code style guidelines
   - Test your changes thoroughly

2. **Pull Request Description**
   - Describe what your PR does
   - Reference related issues
   - Include screenshots for UI changes
   - List any breaking changes

3. **Review Process**
   - Address reviewer feedback
   - Keep the PR focused and small
   - Squash commits if requested
   - Update the PR description as needed

## 🏗️ Development Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- Git

### Quick Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/resume-screener-ai.git
cd resume-screener-ai

# Run automated setup
python setup.py

# Start development servers
./start.sh  # Unix/Linux/Mac
# or
start.bat   # Windows
```

### Manual Setup
```bash
# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys

# Frontend setup
cd ../frontend
npm install

# Start servers
cd ../backend && python run.py &
cd ../frontend && npm start
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Integration Tests
```bash
# Start both servers first
python test_integration.py
```

## 📝 Commit Guidelines

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples
```
feat(bias-detection): add gender bias detection algorithm

Implement new algorithm to detect gender-related bias indicators
in resume text. Includes pronoun detection and name analysis.

Closes #123
```

```
fix(upload): handle large file uploads properly

- Increase file size limit to 16MB
- Add progress indicator for large files
- Improve error handling for upload failures

Fixes #456
```

## 🔒 Security

### Reporting Security Issues
- **DO NOT** open public issues for security vulnerabilities
- Email security concerns to: security@resumescreener.ai
- Include detailed information about the vulnerability
- Allow time for the issue to be addressed before disclosure

### Security Guidelines
- Never commit API keys or sensitive data
- Use environment variables for configuration
- Validate all user inputs
- Implement proper authentication and authorization
- Keep dependencies updated

## 📋 Code Review Checklist

### For Reviewers
- [ ] Code follows style guidelines
- [ ] Tests are included and pass
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance impact is acceptable
- [ ] Backward compatibility is maintained

### For Contributors
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Responsive design tested (for UI changes)
- [ ] Accessibility guidelines followed

## 🎯 Areas for Contribution

### High Priority
- [ ] Multi-language resume support
- [ ] Advanced bias detection algorithms
- [ ] Performance optimizations
- [ ] Mobile responsiveness improvements
- [ ] Accessibility enhancements

### Medium Priority
- [ ] Additional AI model integrations
- [ ] Export functionality (PDF, Excel)
- [ ] Bulk resume processing
- [ ] Advanced analytics dashboard
- [ ] Integration with popular ATS systems

### Low Priority
- [ ] Dark mode theme
- [ ] Keyboard shortcuts
- [ ] Advanced search filters
- [ ] Resume templates
- [ ] Email notifications

## 📚 Resources

### Documentation
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://reactjs.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)

### Tools
- [Postman Collection](./docs/api-collection.json) for API testing
- [Figma Design Files](./docs/design/) for UI reference
- [Database Schema](./docs/database-schema.md)

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Annual contributor appreciation posts

## 📞 Getting Help

- **General Questions**: Open a GitHub discussion
- **Bug Reports**: Create a GitHub issue
- **Feature Requests**: Create a GitHub issue with enhancement label
- **Development Help**: Join our Discord server (link in README)

## 📄 License

By contributing to Resume Screener AI, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Resume Screener AI! Together, we're building a more fair and intelligent recruitment system. 🚀
