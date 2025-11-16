import re
import json
from datetime import datetime

class BiasDetector:
    def __init__(self):
        # Define bias indicators
        self.gender_indicators = {
            'male': ['he/him', 'his', 'mr.', 'mister', 'sir', 'gentleman', 'boy', 'man', 'male'],
            'female': ['she/her', 'hers', 'ms.', 'mrs.', 'miss', 'madam', 'lady', 'girl', 'woman', 'female'],
            'gendered_names': {
                'male': ['john', 'michael', 'david', 'james', 'robert', 'william', 'richard', 'charles', 'joseph', 'thomas'],
                'female': ['mary', 'patricia', 'jennifer', 'linda', 'elizabeth', 'barbara', 'susan', 'jessica', 'sarah', 'karen']
            }
        }
        
        self.age_indicators = [
            'years old', 'age', 'born in', 'birth year', 'birthday',
            'graduated in 19', 'class of 19', 'since 19'
        ]
        
        self.location_indicators = [
            'address', 'street', 'city', 'state', 'country', 'zip code',
            'postal code', 'location', 'based in', 'residing in'
        ]
        
        self.education_bias_indicators = [
            'ivy league', 'harvard', 'yale', 'princeton', 'stanford', 'mit',
            'prestigious', 'elite', 'top-tier', 'renowned'
        ]
        
        # Personal identifiers to remove for blind resume
        self.personal_identifiers = {
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'phone': r'(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
            'address': r'\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct|Place|Pl)',
            'name_line': r'^[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$'
        }
    
    def analyze_bias(self, resume_text):
        """Analyze resume for potential bias indicators"""
        bias_analysis = {
            'overall_bias_score': 0,
            'bias_categories': {
                'gender': self._analyze_gender_bias(resume_text),
                'age': self._analyze_age_bias(resume_text),
                'location': self._analyze_location_bias(resume_text),
                'education': self._analyze_education_bias(resume_text)
            },
            'bias_indicators_found': [],
            'risk_level': 'low',
            'timestamp': datetime.now().isoformat()
        }
        
        # Calculate overall bias score
        category_scores = [cat['score'] for cat in bias_analysis['bias_categories'].values()]
        bias_analysis['overall_bias_score'] = sum(category_scores) / len(category_scores)
        
        # Determine risk level
        if bias_analysis['overall_bias_score'] >= 70:
            bias_analysis['risk_level'] = 'high'
        elif bias_analysis['overall_bias_score'] >= 40:
            bias_analysis['risk_level'] = 'medium'
        else:
            bias_analysis['risk_level'] = 'low'
        
        # Collect all bias indicators
        for category in bias_analysis['bias_categories'].values():
            bias_analysis['bias_indicators_found'].extend(category['indicators'])
        
        return bias_analysis
    
    def _analyze_gender_bias(self, text):
        """Analyze for gender bias indicators"""
        text_lower = text.lower()
        indicators = []
        score = 0
        
        # Check for pronouns
        for gender, pronouns in self.gender_indicators.items():
            if gender != 'gendered_names':
                for pronoun in pronouns:
                    if pronoun in text_lower:
                        indicators.append(f"Gender pronoun: {pronoun}")
                        score += 20
        
        # Check for gendered names
        for gender, names in self.gender_indicators['gendered_names'].items():
            for name in names:
                if name in text_lower:
                    indicators.append(f"Gendered name: {name}")
                    score += 30
        
        return {
            'score': min(score, 100),
            'indicators': indicators,
            'description': 'Gender-related information that could lead to bias'
        }
    
    def _analyze_age_bias(self, text):
        """Analyze for age bias indicators"""
        text_lower = text.lower()
        indicators = []
        score = 0
        
        for indicator in self.age_indicators:
            if indicator in text_lower:
                indicators.append(f"Age indicator: {indicator}")
                score += 25
        
        # Check for graduation years that might indicate age
        graduation_years = re.findall(r'graduated?\s+(?:in\s+)?(\d{4})', text_lower)
        current_year = datetime.now().year
        
        for year in graduation_years:
            year_int = int(year)
            if 1950 <= year_int <= current_year:
                age_estimate = current_year - year_int + 22  # Assume graduation at 22
                if age_estimate > 50 or age_estimate < 25:
                    indicators.append(f"Graduation year suggests age: {year}")
                    score += 30
        
        return {
            'score': min(score, 100),
            'indicators': indicators,
            'description': 'Age-related information that could lead to bias'
        }
    
    def _analyze_location_bias(self, text):
        """Analyze for location bias indicators"""
        text_lower = text.lower()
        indicators = []
        score = 0
        
        for indicator in self.location_indicators:
            if indicator in text_lower:
                indicators.append(f"Location indicator: {indicator}")
                score += 15
        
        # Check for specific addresses
        addresses = re.findall(self.personal_identifiers['address'], text)
        for address in addresses:
            indicators.append(f"Address found: {address[:20]}...")
            score += 25
        
        return {
            'score': min(score, 100),
            'indicators': indicators,
            'description': 'Location-related information that could lead to bias'
        }
    
    def _analyze_education_bias(self, text):
        """Analyze for education bias indicators"""
        text_lower = text.lower()
        indicators = []
        score = 0
        
        for indicator in self.education_bias_indicators:
            if indicator in text_lower:
                indicators.append(f"Prestigious education indicator: {indicator}")
                score += 20
        
        return {
            'score': min(score, 100),
            'indicators': indicators,
            'description': 'Education-related information that could create unfair advantage'
        }
    
    def create_blind_resume(self, resume_text):
        """Create a blind version of the resume with personal identifiers removed"""
        blind_text = resume_text
        
        # Remove emails
        blind_text = re.sub(self.personal_identifiers['email'], '[EMAIL REMOVED]', blind_text)
        
        # Remove phone numbers
        blind_text = re.sub(self.personal_identifiers['phone'], '[PHONE REMOVED]', blind_text)
        
        # Remove addresses
        blind_text = re.sub(self.personal_identifiers['address'], '[ADDRESS REMOVED]', blind_text)
        
        # Remove potential names from the first few lines
        lines = blind_text.split('\n')
        for i, line in enumerate(lines[:5]):
            line_stripped = line.strip()
            # Check if line looks like a name (2-4 words, no numbers, no special chars)
            if (len(line_stripped.split()) <= 4 and 
                len(line_stripped) > 2 and 
                not any(char.isdigit() for char in line_stripped) and
                not any(char in line_stripped for char in ['@', 'http', '.com', '.org']) and
                re.match(r'^[A-Za-z\s]+$', line_stripped)):
                lines[i] = '[CANDIDATE NAME]'
                break
        
        blind_text = '\n'.join(lines)
        
        # Remove gendered pronouns
        gender_replacements = {
            r'\bhe\b': '[CANDIDATE]',
            r'\bhis\b': '[CANDIDATE\'S]',
            r'\bhim\b': '[CANDIDATE]',
            r'\bshe\b': '[CANDIDATE]',
            r'\bher\b': '[CANDIDATE\'S]',
            r'\bhers\b': '[CANDIDATE\'S]'
        }
        
        for pattern, replacement in gender_replacements.items():
            blind_text = re.sub(pattern, replacement, blind_text, flags=re.IGNORECASE)
        
        return blind_text
    
    def get_recommendations(self, bias_analysis):
        """Get recommendations based on bias analysis"""
        recommendations = []
        
        if bias_analysis['overall_bias_score'] > 50:
            recommendations.append("Consider using the blind resume version for initial screening")
        
        if bias_analysis['bias_categories']['gender']['score'] > 30:
            recommendations.append("Remove gender-identifying information before evaluation")
        
        if bias_analysis['bias_categories']['age']['score'] > 30:
            recommendations.append("Focus on skills and experience rather than graduation dates")
        
        if bias_analysis['bias_categories']['location']['score'] > 30:
            recommendations.append("Consider remote work options to reduce location bias")
        
        if bias_analysis['bias_categories']['education']['score'] > 30:
            recommendations.append("Evaluate practical skills alongside educational background")
        
        if not recommendations:
            recommendations.append("Resume shows low bias risk - proceed with standard evaluation")
        
        return recommendations
