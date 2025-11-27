import os
import json
import re
import google.generativeai as genai
from django.conf import settings

class ArenaService:
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.is_configured = True
        else:
            self.is_configured = False

    def generate_quiz(self, topic: str, difficulty: str = "medium") -> dict:
        """
        Gera um Quiz Gamificado usando o modelo estável gemini-1.5-flash.
        """
        if not self.is_configured: 
            print("❌ ERRO: API KEY do Gemini não encontrada no .env")
            return {"error": "IA não configurada. Verifique a API KEY."}

        # 1. Prompt Reforçado para JSON
        prompt = f"""
        Atue como um Game Master de Tecnologia.
        Gere um Quiz de 3 perguntas sobre: '{topic}' (Nível: {difficulty}).
        Idioma: Português do Brasil (PT-BR).
        
        FORMATO DE RESPOSTA OBRIGATÓRIO (JSON RAW):
        {{
            "questions": [
                {{
                    "id": 1,
                    "text": "Pergunta técnica aqui",
                    "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
                    "correct_index": 0,
                    "feedback_correct": "Mensagem curta celebrando o acerto com gíria tech",
                    "feedback_incorrect": "Mensagem curta e divertida sobre o erro",
                    "explanation": "Explicação técnica breve"
                }}
            ]
        }}

        REGRAS CRÍTICAS:
        1. Retorne APENAS o JSON válido.
        2. NÃO use blocos de código markdown (```json).
        """

        try:
            # Configuração para JSON mode (suportado no 1.5 Flash)
            generation_config = {
                "temperature": 0.7,
                "response_mime_type": "application/json" 
            }

            # --- ATUALIZADO: Usando gemini-1.5-flash ---
            model = genai.GenerativeModel(
                "gemini-1.5-flash", 
                generation_config=generation_config
            )
            
            print(f"🤖 [Arena] Solicitando quiz para o tópico: {topic} (Model: gemini-1.5-flash)")
            response = model.generate_content(prompt)
            
            text_response = response.text
            
            # 3. Limpeza Robusta com Regex (Fallback de segurança)
            try:
                return json.loads(text_response)
            except json.JSONDecodeError:
                print(f"⚠️ JSON sujo recebido, tentando limpar com Regex...")
                
                # Tenta encontrar o objeto JSON principal {...}
                match = re.search(r'\{.*\}', text_response, re.DOTALL)
                if match:
                    return json.loads(match.group(0))
                
                # Fallback: Tenta encontrar uma lista [...] e envelopar
                match_arr = re.search(r'\[.*\]', text_response, re.DOTALL)
                if match_arr:
                    return {"questions": json.loads(match_arr.group(0))}
                    
                raise ValueError("Falha ao extrair JSON da resposta.")

        except Exception as e:
            print(f"❌ Erro Crítico na ArenaService: {str(e)}")
            # Retorna erro amigável para o frontend não quebrar
            return {"error": f"O Game Master encontrou um erro: {str(e)}"}