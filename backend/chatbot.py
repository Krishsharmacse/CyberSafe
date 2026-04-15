import requests
import json
import re
import time
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
from duckduckgo_search import DDGS
from dotenv import load_dotenv
import os

load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# ==========================================
# CONFIGURATION
# ==========================================

MODEL_NAME = "z-ai/glm-4.5-air:free"
MAX_RETRIES = 3
RETRY_DELAY = 2  # seconds

class IncidentType(Enum):
    PHISHING = "phishing"
    RANSOMWARE = "ransomware"
    DATA_BREACH = "data_breach"
    MALWARE = "malware"
    UNAUTHORIZED_ACCESS = "unauthorized_access"
    DDOS = "ddos"
    OTHER = "other"

@dataclass
class IncidentReport:
    description: str
    incident_type: IncidentType
    severity: int  # 1-5, 5 being most severe
    timestamp: datetime
    affected_systems: List[str]
    compromised_data: bool

# ==========================================
# INCIDENT CLASSIFICATION
# ==========================================

def classify_incident(description: str) -> Tuple[IncidentType, int]:
    """Classify the incident type and estimate severity based on keywords."""
    description_lower = description.lower()
    
    # Severity keywords
    high_severity = ["ransomware", "encrypted", "ransom", "bank", "financial", "ssn", "social security", "credit card"]
    medium_severity = ["phishing", "clicked link", "email", "password", "credentials", "suspicious"]
    low_severity = ["spam", "adware", "popup", "suspicious email"]
    
    severity = 3  # default medium
    if any(word in description_lower for word in high_severity):
        severity = 5
    elif any(word in description_lower for word in low_severity):
        severity = 2
    
    # Classify incident type
    if any(word in description_lower for word in ["phish", "clicked link", "email link", "sms"]):
        return IncidentType.PHISHING, severity
    elif any(word in description_lower for word in ["ransom", "encrypted my files", "bitcoin"]):
        return IncidentType.RANSOMWARE, severity
    elif any(word in description_lower for word in ["breach", "exposed", "leaked", "unauthorized access"]):
        return IncidentType.DATA_BREACH, severity
    elif any(word in description_lower for word in ["malware", "virus", "trojan", "downloaded file"]):
        return IncidentType.MALWARE, severity
    elif any(word in description_lower for word in ["unauthorized", "strange login", "unknown device"]):
        return IncidentType.UNAUTHORIZED_ACCESS, severity
    else:
        return IncidentType.OTHER, severity

# ==========================================
# ENHANCED SEARCH
# ==========================================

def search_mitigation_steps(query: str, max_results: int = 5, incident_type: IncidentType = None) -> Dict:
    """Enhanced search with multiple query strategies and source prioritization."""
    
    # Generate multiple search queries for better coverage
    queries = [
        query,
        f"{incident_type.value if incident_type else ''} incident response steps",
        f"emergency {incident_type.value if incident_type else 'cyber'} attack what to do now"
    ]
    
    all_results = []
    seen_urls = set()
    
    for q in queries[:2]:  # Limit to 2 queries to avoid rate limiting
        print(f"[*] Searching DuckDuckGo: '{q[:50]}...'")
        
        try:
            with DDGS() as ddgs:
                results = list(ddgs.text(q, max_results=max_results))
                for result in results:
                    url = result.get('href', '')
                    if url not in seen_urls:
                        seen_urls.add(url)
                        all_results.append({
                            'title': result.get('title', ''),
                            'snippet': result.get('body', ''),
                            'source': url
                        })
                time.sleep(1)  # Be respectful to the search service
        except Exception as e:
            print(f"[!] Search error for '{q}': {e}")
            continue
    
    # Prioritize results from authoritative sources
    trusted_domains = ['cisa.gov', 'ncsc.gov.uk', 'cert.gov', 'cyber.gov.au', 'gov', 'microsoft.com', 'kaspersky.com']
    
    prioritized = []
    other = []
    
    for result in all_results:
        url = result.get('source', '').lower()
        if any(domain in url for domain in trusted_domains):
            prioritized.append(result)
        else:
            other.append(result)
    
    final_results = prioritized + other
    
    # Format context
    search_context = ""
    for i, result in enumerate(final_results[:max_results]):
        search_context += f"Result {i+1}:\nTitle: {result['title']}\nSource: {result['source']}\nSnippet: {result['snippet']}\n\n"
    
    return {
        'context': search_context,
        'result_count': len(final_results),
        'sources': [r['source'] for r in final_results[:3]]
    }

# ==========================================
# ENHANCED LLM RESPONSE
# ==========================================

def generate_incident_response(incident: IncidentReport, search_context: str) -> Dict:
    """Generate structured response with immediate actions, recovery steps, and prevention."""
    
    print("[*] Generating response via OpenRouter...")
    
    url = "https://openrouter.ai/api/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/yourusername/incident-bot",
        "X-Title": "Incident Response Assistant"
    }
    
    # Enhanced system prompt for structured output
    system_prompt = """You are an expert Cybersecurity Incident Response handler. Provide responses in the following EXACT format:

🚨 IMMEDIATE ACTIONS (Do these RIGHT NOW):
• [Action 1]
• [Action 2]

🔍 CONTAINMENT STEPS (Stop the spread):
• [Step 1]
• [Step 2]

🛠️ RECOVERY STEPS (Get back to normal):
• [Step 1]
• [Step 2]

🛡️ PREVENTION TIPS (Avoid this happening again):
• [Tip 1]
• [Tip 2]

⚠️ RED FLAGS TO WATCH FOR:
• [Flag 1]
• [Flag 2]

Be specific, actionable, and prioritize steps by urgency. Use the web search context for current best practices."""

    user_prompt = f"""INCIDENT DETAILS:
Type: {incident.incident_type.value}
Severity Level: {incident.severity}/5
Description: {incident.description}
Affected Systems: {', '.join(incident.affected_systems) if incident.affected_systems else 'Not specified'}

RECENT GUIDANCE FROM SECURITY SOURCES:
{search_context}

Based on this information, provide your structured response using the format specified above."""

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.3,  # Lower temperature for more consistent, factual responses
        "max_tokens": 1500
    }
    
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            
            response_data = response.json()
            content = response_data['choices'][0]['message']['content']
            
            # Parse the structured response
            sections = parse_structured_response(content)
            return {
                'success': True,
                'full_response': content,
                'sections': sections,
                'sources_used': None
            }
            
        except requests.exceptions.Timeout:
            print(f"[!] Timeout (attempt {attempt + 1}/{MAX_RETRIES})")
            if attempt == MAX_RETRIES - 1:
                return {'success': False, 'error': 'API timeout - please try again'}
        except requests.exceptions.RequestException as e:
            print(f"[!] API error (attempt {attempt + 1}): {e}")
            if attempt == MAX_RETRIES - 1:
                return {'success': False, 'error': str(e)}
        time.sleep(RETRY_DELAY)
    
    return {'success': False, 'error': 'Max retries exceeded'}

def parse_structured_response(content: str) -> Dict[str, str]:
    """Parse the structured response into sections."""
    sections = {}
    current_section = None
    
    lines = content.split('\n')
    for line in lines:
        line = line.strip()
        if line.startswith('🚨') or 'IMMEDIATE ACTIONS' in line.upper():
            current_section = 'immediate'
            sections['immediate'] = []
        elif line.startswith('🔍') or 'CONTAINMENT' in line.upper():
            current_section = 'containment'
            sections['containment'] = []
        elif line.startswith('🛠️') or 'RECOVERY' in line.upper():
            current_section = 'recovery'
            sections['recovery'] = []
        elif line.startswith('🛡️') or 'PREVENTION' in line.upper():
            current_section = 'prevention'
            sections['prevention'] = []
        elif line.startswith('⚠️') or 'RED FLAGS' in line.upper():
            current_section = 'red_flags'
            sections['red_flags'] = []
        elif line.startswith('•') or line.startswith('-') and current_section:
            sections[current_section].append(line.lstrip('•- '))
    
    # Clean up - convert lists to formatted strings
    for key in sections:
        if isinstance(sections[key], list):
            sections[key] = '\n'.join(f"  • {item}" for item in sections[key])
    
    return sections

# ==========================================
# ENHANCED HELPLINES
# ==========================================

def print_helplines(incident_type: IncidentType = None):
    """Print targeted helplines based on incident type."""
    print("\n" + "="*60)
    print("☎️ EMERGENCY CONTACTS ☎️")
    print("="*60)
    
    # Incident-specific advice
    if incident_type == IncidentType.PHISHING:
        print("📧 For phishing: Forward the suspicious email to report@phishing.gov.uk (UK) or reportphishing@apwg.org (International)")
    elif incident_type == IncidentType.RANSOMWARE:
        print("💰 For ransomware: DO NOT pay the ransom. Contact your local FBI/CISA field office immediately.")
    elif incident_type == IncidentType.DATA_BREACH:
        print("📊 For data breach: Contact your bank immediately if financial data was involved.")
    
    print("\n🇮🇳 INDIA: Dial 1930 or visit cybercrime.gov.in")
    print("🇺🇸 USA: 1-888-282-0870 (CISA) or ic3.gov")
    print("🇬🇧 UK: 0300 123 2040 (Action Fraud)")
    print("🇦🇺 AUSTRALIA: 1300 292 371 (ReportCyber)")
    print("🇪🇺 EU: Contact your national DPA or ENISA")
    print("🌍 Global: Search for your national CERT")
    print("="*60)

# ==========================================
# EXPORT FUNCTION
# ==========================================

def export_report(incident: IncidentReport, response: Dict, filename: str = None):
    """Export the incident and response to a JSON file."""
    if not filename:
        filename = f"incident_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    report = {
        'incident': {
            'description': incident.description,
            'type': incident.incident_type.value,
            'severity': incident.severity,
            'timestamp': incident.timestamp.isoformat(),
            'affected_systems': incident.affected_systems
        },
        'response': {
            'generated_at': datetime.now().isoformat(),
            'content': response.get('full_response', ''),
            'sections': response.get('sections', {})
        }
    }
    
    try:
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)
        print(f"\n📄 Report saved to: {filename}")
        return True
    except Exception as e:
        print(f"\n[!] Could not save report: {e}")
        return False

# ==========================================
# MAIN APPLICATION
# ==========================================

def main():
    print("="*60)
    print("🛡️ CYBERSECURITY INCIDENT RESPONSE ASSISTANT 🛡️")
    print("Version 2.0 - Enhanced Edition")
    print("="*60)
    print("\n⚠️  DISCLAIMER: This is AI-generated guidance. For severe breaches, contact professionals immediately.")
    print("💡 TIP: Be as specific as possible for better advice.\n")
    
    # Get incident description
    incident_desc = input("📝 Please describe what happened:\n> ").strip()
    
    if not incident_desc:
        print("❌ No incident described. Exiting.")
        return
    
    # Optional: affected systems
    affected = input("\n💻 What systems are affected? (e.g., 'work laptop, personal email, bank account')\n> ").strip()
    affected_systems = [s.strip() for s in affected.split(',')] if affected else []
    
    # Classify the incident
    incident_type, severity = classify_incident(incident_desc)
    print(f"\n📊 Analysis: Detected as {incident_type.value.upper()} (Severity: {severity}/5)")
    
    # Create incident report object
    incident = IncidentReport(
        description=incident_desc,
        incident_type=incident_type,
        severity=severity,
        timestamp=datetime.now(),
        affected_systems=affected_systems,
        compromised_data=None
    )
    
    # Search for relevant guidance
    print("\n🔍 Searching for current mitigation guidance...")
    search_query = f"emergency {incident_type.value} incident response mitigation {incident_desc[:50]}"
    search_results = search_mitigation_steps(search_query, incident_type=incident_type)
    
    if search_results['result_count'] == 0:
        print("⚠️ Limited search results found. Proceeding with general guidance.")
    
    # Generate response
    response = generate_incident_response(incident, search_results['context'])
    
    # Display results
    print("\n" + "="*60)
    print("🚨 INCIDENT RESPONSE PLAN 🚨")
    print("="*60)
    
    if response['success']:
        print(response['full_response'])
        
        # Show sources if available
        if search_results.get('sources'):
            print("\n📚 SOURCES CONSULTED:")
            for source in search_results['sources'][:3]:
                print(f"   • {source}")
    else:
        print(f"❌ Error generating response: {response.get('error', 'Unknown error')}")
        print("\n🔄 FALLBACK ADVICE:")
        print("   1. Disconnect affected device from the internet immediately")
        print("   2. Change passwords from a CLEAN, trusted device")
        print("   3. Contact your IT security team or local cyber crime unit")
        print("   4. Document everything that happened")
    
    # Display helplines
    print_helplines(incident_type)
    
    # Offer to save report
    save = input("\n💾 Save this report to file? (y/n): ").strip().lower()
    if save == 'y':
        export_report(incident, response)
    
    print("\n✅ Stay vigilant. Consider enabling multi-factor authentication everywhere.")
    print("⚠️ Remember: If this is an emergency, disconnect from the network NOW and call your security team.\n")

if __name__ == "__main__":
    # Check for API key
    if not OPENROUTER_API_KEY:
        print("❌ ERROR: OPENROUTER_API_KEY not found in .env file")
        print("Please create a .env file with: OPENROUTER_API_KEY=your_key_here")
        exit(1)
    
    9()