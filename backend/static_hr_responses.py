"""
Static HR Assistant Responses for Demonstration
This file contains example responses for various HR queries
"""

# Static response examples for HR Assistant queries

def get_static_response(query_type):
    """Return static response based on query type"""

    responses = {
        "top_5_candidates": """**Top 5 Candidates by Score:**

1. **Sarah Johnson** - 92% (Highly Qualified)
   • Experience: 7 years
   • Key Skills: Python, Machine Learning, Data Analysis

2. **Michael Chen** - 89% (Highly Qualified)
   • Experience: 6 years
   • Key Skills: JavaScript, React, Node.js

3. **Emily Rodriguez** - 87% (Highly Qualified)
   • Experience: 5 years
   • Key Skills: SQL, Tableau, Business Intelligence

4. **David Kim** - 85% (Qualified)
   • Experience: 8 years
   • Key Skills: Java, Spring Boot, Microservices

5. **Lisa Thompson** - 83% (Qualified)
   • Experience: 4 years
   • Key Skills: Python, Django, PostgreSQL""",

        "highly_qualified": """**Highly Qualified Candidates (3 found):**

1. **Sarah Johnson** - 92%
   • Experience: 7 years
   • Key Skills: Python, Machine Learning, Data Analysis

2. **Michael Chen** - 89%
   • Experience: 6 years
   • Key Skills: JavaScript, React, Node.js

3. **Emily Rodriguez** - 87%
   • Experience: 5 years
   • Key Skills: SQL, Tableau, Business Intelligence""",

        "skills_analysis": """**Most Common Skills Among Candidates:**

• **Python** - 8 candidates (80.0%)
• **JavaScript** - 6 candidates (60.0%)
• **SQL** - 7 candidates (70.0%)
• **Machine Learning** - 4 candidates (40.0%)
• **React** - 5 candidates (50.0%)
• **Data Analysis** - 6 candidates (60.0%)
• **Java** - 3 candidates (30.0%)
• **Node.js** - 4 candidates (40.0%)
• **Tableau** - 3 candidates (30.0%)
• **Django** - 2 candidates (20.0%)""",

        "experience_filter": """**Candidates with 5+ Years Experience (4 found):**

1. **Sarah Johnson** - 7 years experience
   • Score: 92% (Highly Qualified)
   • Skills: Python, Machine Learning, Data Analysis

2. **David Kim** - 8 years experience
   • Score: 85% (Qualified)
   • Skills: Java, Spring Boot, Microservices

3. **Michael Chen** - 6 years experience
   • Score: 89% (Highly Qualified)
   • Skills: JavaScript, React, Node.js

4. **Robert Wilson** - 5 years experience
   • Score: 81% (Qualified)
   • Skills: C++, Qt, Embedded Systems""",

        "candidate_comparison": """**Top 3 Candidates Comparison:**

**1. Sarah Johnson**
• Score: 92% (Highly Qualified)
• Experience: 7 years
• Key Skills: Python, Machine Learning, Data Analysis
• Top Strengths: Technical expertise, Problem-solving, Leadership

**2. Michael Chen**
• Score: 89% (Highly Qualified)
• Experience: 6 years
• Key Skills: JavaScript, React, Node.js
• Top Strengths: Full-stack development, UI/UX focus, Team collaboration

**3. Emily Rodriguez**
• Score: 87% (Highly Qualified)
• Experience: 5 years
• Key Skills: SQL, Tableau, Business Intelligence
• Top Strengths: Data visualization, Analytical thinking, Communication""",

        "recent_uploads": """**Recent Uploads This Week (5 candidates):**

1. **Sarah Johnson** - Uploaded today
   • Score: 92% (Highly Qualified)
   • Skills: Python, Machine Learning, Data Analysis

2. **Michael Chen** - Uploaded 1 day ago
   • Score: 89% (Highly Qualified)
   • Skills: JavaScript, React, Node.js

3. **Emily Rodriguez** - Uploaded 2 days ago
   • Score: 87% (Highly Qualified)
   • Skills: SQL, Tableau, Business Intelligence

4. **David Kim** - Uploaded 3 days ago
   • Score: 85% (Qualified)
   • Skills: Java, Spring Boot, Microservices

5. **Lisa Thompson** - Uploaded 5 days ago
   • Score: 83% (Qualified)
   • Skills: Python, Django, PostgreSQL""",

        "statistics": """**Candidate Statistics:**

• Total Candidates: 10
• Highly Qualified: 3
• Qualified: 5
• Average Score: 84.2%
• Top Score: 92%
• Experience Range: 2 - 8 years""",

        "default": """I have candidate data available in the system. You can ask me about:

• Top candidates by score
• Highly qualified candidates
• Skills analysis and distribution
• Experience-based filtering
• Candidate comparisons
• Recent uploads
• Statistics and analytics

Try asking: "Who are the top 5 candidates?" or "What skills are most common among candidates?" """
    }

    # Map query keywords to response types
    query_mappings = {
        "top 5": "top_5_candidates",
        "top candidates": "top_5_candidates",
        "highest scoring": "top_5_candidates",
        "ranked list": "top_5_candidates",
        "highly qualified": "highly_qualified",
        "top category": "highly_qualified",
        "skills": "skills_analysis",
        "skill distribution": "skills_analysis",
        "most common": "skills_analysis",
        "analyze skill": "skills_analysis",
        "5+": "experience_filter",
        "five+": "experience_filter",
        "years experience": "experience_filter",
        "experience level": "experience_filter",
        "compare": "candidate_comparison",
        "comparison": "candidate_comparison",
        "side-by-side": "candidate_comparison",
        "recent": "recent_uploads",
        "uploads": "recent_uploads",
        "latest": "recent_uploads",
        "submissions": "recent_uploads",
        "statistics": "statistics",
        "stats": "statistics"
    }

    query_lower = query_type.lower()

    # Find matching response type
    for keyword, response_type in query_mappings.items():
        if keyword in query_lower:
            return responses[response_type]

    # Default response
    return responses["default"]

# Example usage
if __name__ == "__main__":
    queries = [
        "Who are the top 5 candidates by score?",
        "Show me all highly qualified candidates",
        "What skills are most common among candidates?",
        "Find candidates with 5+ years experience",
        "Compare top 3 candidates for Data Scientist role",
        "Show recent uploads this week",
        "What are the statistics?"
    ]

    for query in queries:
        print(f"\nQuery: {query}")
        print("Response:")
        print(get_static_response(query))
        print("-" * 80)
