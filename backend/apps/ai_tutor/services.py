import os
from openai import OpenAI

class AIService:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        base_url = "https://api.aimlapi.com/v1"
        self.client = OpenAI(api_key=api_key, base_url=base_url) if api_key else None

    def get_pedagogical_answer(self, question: str, subject: str = "Geral") -> str:
        if not self.client: return "Erro: API Key da IA não configurada."
        
        prompt = "Você é um Tutor Socrático. Nunca dê a resposta direta. Responda em Português."
        try:
            response = self.client.chat.completions.create(
                model="meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
                messages=[{"role": "system", "content": prompt}, {"role": "user", "content": f"{subject}: {question}"}],
                max_tokens=1024
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Erro na IA: {str(e)}"