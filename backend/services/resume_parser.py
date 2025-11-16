import PyPDF2
from docx import Document
import re
import os
from datetime import datetime

class ResumeParser:
    def __init__(self):
        # Enhanced skill patterns for better detection
        self.technical_skills = [
            # Programming Languages
            'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'C', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
            'Scala', 'R', 'MATLAB', 'Perl', 'Shell', 'Bash', 'PowerShell', 'VB.NET', 'Objective-C', 'Dart', 'Elixir',
            
            # Web Technologies
            'HTML', 'CSS', 'SCSS', 'SASS', 'React', 'Angular', 'Vue.js', 'Vue', 'Node.js', 'Express.js', 'Express',
            'Next.js', 'Nuxt.js', 'Svelte', 'jQuery', 'Bootstrap', 'Tailwind CSS', 'Material-UI', 'Chakra UI',
            
            # Databases
            'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'Cassandra',
            'DynamoDB', 'Firebase', 'Elasticsearch', 'Neo4j', 'CouchDB', 'MariaDB',
            
            # Cloud & DevOps
            'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'DevOps',
            'Terraform', 'Ansible', 'Chef', 'Puppet', 'Vagrant', 'Nginx', 'Apache', 'Linux', 'Ubuntu',
            
            # Frameworks & Libraries
            'Django', 'Flask', 'FastAPI', 'Spring', 'Spring Boot', 'Hibernate', 'Laravel', 'Symfony',
            'Rails', 'Ruby on Rails', 'ASP.NET', '.NET', 'Entity Framework', 'Xamarin',
            
            # Mobile Development
            'Android', 'iOS', 'React Native', 'Flutter', 'Ionic', 'Cordova', 'PhoneGap',
            
            # Data Science & AI
            'Machine Learning', 'Deep Learning', 'AI', 'Artificial Intelligence', 'Data Science', 'Data Analysis',
            'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn',
            'Jupyter', 'Apache Spark', 'Hadoop', 'Tableau', 'Power BI', 'Excel', 'Statistics',
            
            # Version Control & Tools
            'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN', 'Mercurial', 'JIRA', 'Confluence', 'Slack',
            'Trello', 'Asana', 'Notion', 'VS Code', 'IntelliJ', 'Eclipse', 'Visual Studio',
            
            # Methodologies
            'Agile', 'Scrum', 'Kanban', 'Waterfall', 'DevOps', 'TDD', 'BDD', 'Microservices',
            'REST API', 'GraphQL', 'SOAP', 'API Development', 'Web Services',
            
            # Soft Skills
            'Leadership', 'Team Management', 'Project Management', 'Communication', 'Problem Solving',
            'Critical Thinking', 'Analytical Skills', 'Time Management', 'Collaboration', 'Mentoring'
        ]
        
        # Education keywords
        self.education_keywords = [
            'bachelor', 'master', 'phd', 'doctorate', 'degree', 'university', 'college', 'institute',
            'school', 'education', 'b.s.', 'm.s.', 'b.a.', 'm.a.', 'mba', 'b.tech', 'm.tech',
            'b.e.', 'm.e.', 'diploma', 'certificate', 'certification', 'course', 'training'
        ]
    
    def extract_text(self, file_path):
        """Extract text from PDF or DOCX file"""
        try:
            file_extension = os.path.splitext(file_path)[1].lower()
            
            if file_extension == '.pdf':
                return self._extract_from_pdf(file_path)
            elif file_extension == '.docx':
                return self._extract_from_docx(file_path)
            else:
                raise ValueError(f"Unsupported file format: {file_extension}")
                
        except Exception as e:
            raise Exception(f"Error extracting text from file: {str(e)}")
    
    def _extract_from_pdf(self, file_path):
        """Extract text from PDF file"""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            return self._clean_text(text)
        except Exception as e:
            raise Exception(f"Error reading PDF: {str(e)}")
    
    def _extract_from_docx(self, file_path):
        """Extract text from DOCX file"""
        try:
            doc = Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return self._clean_text(text)
        except Exception as e:
            raise Exception(f"Error reading DOCX: {str(e)}")
    
    def _clean_text(self, text):
        """Clean and normalize extracted text while preserving structure"""
        # Preserve line breaks for better parsing
        lines = text.split('\n')
        cleaned_lines = []
        
        for line in lines:
            # Remove excessive whitespace but keep structure
            cleaned_line = re.sub(r'\s+', ' ', line.strip())
            if cleaned_line:  # Only add non-empty lines
                cleaned_lines.append(cleaned_line)
        
        return '\n'.join(cleaned_lines)
    
    def extract_contact_info(self, text):
        """Advanced contact information extraction"""
        contact_info = {}
        lines = text.split('\n')
        
        # Enhanced email extraction
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text, re.IGNORECASE)
        if emails:
            contact_info['email'] = emails[0]
        
        # Enhanced phone number extraction
        phone_patterns = [
            r'\+\d{1,3}[-.\s]?\d{10}',  # International format
            r'\+\d{1,3}[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}',
            r'\(\d{3}\)\s*\d{3}[-.\s]?\d{4}',  # (123) 456-7890
            r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}',  # 123-456-7890
            r'\d{10}',  # 1234567890
        ]
        
        for pattern in phone_patterns:
            phones = re.findall(pattern, text)
            if phones:
                contact_info['phone'] = phones[0]
                break
        
        # Advanced name extraction
        name = self._extract_name_advanced(lines)
        if name:
            contact_info['name'] = name
        
        return contact_info
    
    def _extract_name_advanced(self, lines):
        """Advanced name extraction with multiple strategies"""
        # Strategy 1: Look for name patterns in first few lines
        for i, line in enumerate(lines[:8]):
            line = line.strip()
            
            # Skip empty lines, emails, phones, addresses
            if not line or '@' in line or any(char.isdigit() for char in line if len([c for c in line if c.isdigit()]) > 3):
                continue
            
            # Skip common resume headers
            skip_words = ['resume', 'cv', 'curriculum', 'vitae', 'profile', 'summary', 'objective', 
                         'experience', 'education', 'skills', 'contact', 'address', 'phone', 'email']
            if any(word in line.lower() for word in skip_words):
                continue
            
            # Look for name patterns
            words = line.split()
            if 2 <= len(words) <= 4:  # Names typically have 2-4 words
                # Check if it looks like a name (mostly alphabetic)
                if all(word.replace('.', '').replace(',', '').isalpha() for word in words):
                    # Check if it's in title case or all caps
                    if line.istitle() or line.isupper():
                        return line
        
        # Strategy 2: Look for "Name:" pattern
        for line in lines[:10]:
            name_match = re.search(r'name\s*[:\-]\s*([A-Za-z\s\.]+)', line, re.IGNORECASE)
            if name_match:
                return name_match.group(1).strip()
        
        return None
    
    def extract_skills(self, text):
        """Enhanced skill extraction with context awareness"""
        found_skills = []
        text_lower = text.lower()
        
        # Look for skills in context
        for skill in self.technical_skills:
            skill_lower = skill.lower()
            
            # Direct match
            if skill_lower in text_lower:
                found_skills.append(skill)
                continue
            
            # Handle variations (e.g., "Node.js" vs "Node", "C++" vs "C plus plus")
            variations = self._get_skill_variations(skill)
            for variation in variations:
                if variation.lower() in text_lower:
                    found_skills.append(skill)
                    break
        
        # Remove duplicates while preserving order
        seen = set()
        unique_skills = []
        for skill in found_skills:
            if skill not in seen:
                seen.add(skill)
                unique_skills.append(skill)
        
        return unique_skills
    
    def _get_skill_variations(self, skill):
        """Get common variations of skill names"""
        variations = [skill]
        
        skill_variations = {
            'JavaScript': ['JS', 'Javascript', 'ECMAScript'],
            'TypeScript': ['TS', 'Typescript'],
            'Node.js': ['Node', 'NodeJS', 'Node JS'],
            'React': ['ReactJS', 'React.js'],
            'Angular': ['AngularJS', 'Angular.js'],
            'Vue.js': ['Vue', 'VueJS', 'Vue JS'],
            'C++': ['C plus plus', 'CPP'],
            'C#': ['C sharp', 'CSharp'],
            'ASP.NET': ['ASP NET', 'ASPNET'],
            'Machine Learning': ['ML', 'MachineLearning'],
            'Artificial Intelligence': ['AI'],
            'Deep Learning': ['DL', 'DeepLearning'],
            'Data Science': ['DataScience'],
            'PostgreSQL': ['Postgres', 'PostGres'],
            'MongoDB': ['Mongo'],
            'Express.js': ['Express', 'ExpressJS'],
            'REST API': ['REST', 'RESTful', 'RESTful API'],
            'GraphQL': ['Graph QL'],
        }
        
        if skill in skill_variations:
            variations.extend(skill_variations[skill])
        
        return variations
    
    def extract_experience_years(self, text):
        """Enhanced experience extraction"""
        # Multiple patterns for experience detection
        experience_patterns = [
            r'(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)',
            r'(\d+)\+?\s*yrs?\s*(?:of\s*)?(?:experience|exp)',
            r'experience[:\s]*(\d+)\+?\s*years?',
            r'(\d+)\+?\s*years?\s*in',
            r'(\d+)\+?\s*years?\s*(?:working|work)',
            r'total\s*(?:of\s*)?(\d+)\+?\s*years?',
            r'over\s*(\d+)\+?\s*years?',
            r'more\s*than\s*(\d+)\+?\s*years?'
        ]
        
        text_lower = text.lower()
        max_experience = 0
        
        for pattern in experience_patterns:
            matches = re.findall(pattern, text_lower)
            for match in matches:
                try:
                    years = int(match)
                    max_experience = max(max_experience, years)
                except ValueError:
                    continue
        
        # If no explicit experience found, estimate from work history dates
        if max_experience == 0:
            max_experience = self._estimate_experience_from_dates(text)
        
        return max_experience
    
    def _estimate_experience_from_dates(self, text):
        """Estimate experience from date ranges in work history"""
        current_year = datetime.now().year
        years = re.findall(r'\b(19|20)\d{2}\b', text)
        
        if len(years) >= 2:
            years = [int(year) for year in years if 1990 <= int(year) <= current_year]
            if years:
                earliest_year = min(years)
                return min(current_year - earliest_year, 25)  # Cap at 25 years
        
        return 0
    
    def extract_education(self, text):
        """Extract education information with better parsing"""
        education_info = []
        lines = text.split('\n')
        
        # Look for education sections
        education_section_found = False
        current_education = ""
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check if this line indicates start of education section
            if any(keyword in line.lower() for keyword in ['education', 'academic', 'qualification']):
                education_section_found = True
                continue
            
            # If we're in education section or line contains education keywords
            if education_section_found or any(keyword in line.lower() for keyword in self.education_keywords):
                # Skip section headers
                if line.lower() in ['education', 'academic background', 'qualifications']:
                    continue
                
                # Look for degree patterns
                degree_patterns = [
                    r'(bachelor|master|phd|doctorate|diploma|certificate).*?(?:in|of)\s*([^,\n]+)',
                    r'(b\.?[aes]\.?|m\.?[aes]\.?|phd|mba|m\.?tech|b\.?tech).*?(?:in|of)?\s*([^,\n]+)',
                    r'(degree)\s*(?:in|of)\s*([^,\n]+)'
                ]
                
                for pattern in degree_patterns:
                    match = re.search(pattern, line, re.IGNORECASE)
                    if match:
                        degree_type = match.group(1)
                        field = match.group(2) if len(match.groups()) > 1 else ""
                        education_info.append(f"{degree_type} {field}".strip())
                        break
                else:
                    # If no pattern matched but contains education keywords, add the line
                    if any(keyword in line.lower() for keyword in self.education_keywords):
                        education_info.append(line)
        
        return education_info if education_info else ["Education information not clearly specified"]
