import requests
import json
from duckduckgo_search import DDGS

# ==========================================
# CONFIGURATION
# ==========================================
OPENROUTER_API_KEY = "YOUR_OPENROUTER_API_KEY"
# You can change the model to any available OpenRouter model 
# (e.g., "anthropic/claude-3-haiku", "google/gemini-pro", "mistralai/mixtral-8x7b-instruct")
MODEL_NAME = "mistralai/mixtral-8x7b-instruct" 

def search_mitigation_steps(query, max_results=3):
    """Searches DuckDuckGo for the latest guidance on the specific incident."""
    print(f"[*] Searching DuckDuckGo for: '{query}'...")
    search_context = ""
    try:
        with DDGS() as ddgs:
            results = ddgs.text(query, max_results=max_results)
            for i, result in enumerate(results):
                search_context += f"Result {i+1}:\nTitle: {result.get('title')}\nSnippet: {result.get('body')}\n\n"
        return search_context
    except Exception as e:
        print(f"[!] Error during DuckDuckGo search: {e}")
        return "No recent search context available due to an error."

def generate_incident_response(incident_description, search_context):
    """Sends the incident and search context to an LLM via OpenRouter for actionable advice."""
    print("[*] Analyzing data and generating response via OpenRouter...")
    
    url = "https://openrouter.ai/api/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/yourusername/incident-bot", # Optional but recommended by OpenRouter
        "X-Title": "Incident Response Assistant" # Optional but recommended by OpenRouter
    }

    system_prompt = (
        "You are an expert Cybersecurity Incident Response handler. "
        "Your goal is to provide immediate, clear, prioritized, and actionable steps "
        "to a user who has just experienced a cyberattack or phishing incident. "
        "Use the provided web search context to inform your advice, but format it clearly."
    )

    user_prompt = (
        f"Incident Description: {incident_description}\n\n"
        f"Recent Web Search Context for Mitigation:\n{search_context}\n\n"
        "Based on the situation and the web context, what exact steps should I take right now to secure my accounts, "
        "limit the damage, and recover?"
    )

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    }

    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        response.raise_for_status() # Raise an exception for bad status codes
        
        response_data = response.json()
        return response_data['choices'][0]['message']['content']
        
    except requests.exceptions.RequestException as e:
        return f"[!] API Request Error: {e}"
    except KeyError:
        return f"[!] Unexpected API Response Format: {response.text}"

def main():
    print("==================================================")
    print("🛡️ Cybersecurity Incident Response Assistant 🛡️")
    print("==================================================\n")
    
    # 1. Get the user's situation
    incident = input("Please describe what happened (e.g., 'I clicked a phishing link in a FedEx email'):\n> ")
    
    if not incident.strip():
        print("No incident described. Exiting.")
        return

    # 2. Formulate a search query based on the incident
    search_query = f"what to do after {incident} mitigation recovery steps cybersecurity"
    
    # 3. Get search results from DuckDuckGo
    search_context = search_mitigation_steps(search_query)
    
    # 4. Generate the response plan using OpenRouter
    guidance = generate_incident_response(incident, search_context)
    
    # 5. Output the results
    print("\n==================================================")
    print("🚨 IMMEDIATE ACTION PLAN 🚨")
    print("==================================================\n")
    print(guidance)
    print("\n==================================================")
    print("Disclaimer: This is AI-generated advice. If this is a severe breach involving financial or sensitive corporate data, disconnect the affected device from the internet immediately and contact a professional IT security team.")

if __name__ == "__main__":
    main()