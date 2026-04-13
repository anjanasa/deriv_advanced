import os
import sys
from groq import Groq

# Configuration
client = Groq(api_key="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")
MODEL = "deepseek-r1-distill-llama-70b"

SYSTEM_PROMPT = """
You are an Advanced Full-Stack Web Agent. 
Expertise: React, Tailwind CSS, Modern JS (ES6+), and HTML5.
Your goal is to write production-ready, clean, and modular code.
When asked to create a component, provide the full code.
"""

def get_code_from_groq(prompt):
    completion = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2, # Low temperature for better coding logic
        max_tokens=4096
    )
    return completion.choices[0].message.content

if __name__ == "__main__":
    user_input = " ".join(sys.argv[1:])
    if not user_input:
        user_input = input("What should we build/fix? ")
    
    print(f"\n🚀 Groq is thinking...")
    response = get_code_from_groq(user_input)
    print("\n" + response)