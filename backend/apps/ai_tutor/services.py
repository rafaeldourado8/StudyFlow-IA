import os
import json
import google.generativeai as genai
from django.conf import settings
# Importamos o modelo de cache
from .models import TopicCache 

class AIService:
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.is_configured = True
        else:
            self.is_configured = False

    def get_pedagogical_answer(self, question: str, subject: str = "Geral") -> str:
        # ... (mantenha o código anterior deste método igual) ...
        if not self.is_configured: return "Erro: API Key não configurada."
        try:
            model = genai.GenerativeModel("gemini-2.0-flash", system_instruction="Tutor Socrático.")
            response = model.generate_content(f"{subject}: {question}")
            return response.text
        except Exception as e: return f"Erro IA: {str(e)}"

    def analyze_topic(self, topic: str, depth: str = "initial") -> dict:
        """
        Gera análise com estratégia Cache-Aside (Banco -> API -> Banco)
        """
        # 1. Normalização (para 'Docker' e 'docker' serem o mesmo cache)
        clean_topic = topic.strip().lower()
        cache_key = f"{clean_topic}_{depth}" # Chave composta se quiser diferenciar deep de initial

        # ====================================================
        # 🟢 PASSO 1 DO FLUXOGRAMA: Verificar se já existe
        # ====================================================
        print(f"🔍 Buscando cache para: {clean_topic} (Nível: {depth})")
        
        # Tentamos buscar no banco. Usamos filter().first() para evitar erro se não existir
        cached_entry = TopicCache.objects.filter(topic=clean_topic, depth=depth).first()
        
        if cached_entry:
            print("⚡ CACHE HIT: Retornando dados do banco local.")
            return cached_entry.data

        # ====================================================
        # 🔴 ELSE: Não existe, chamar a IA (Pensamento/Pesquisa)
        # ====================================================
        print("ww CACHE MISS: Consultando Gemini IA...")
        
        if not self.is_configured:
            return {"error": "IA não configurada"}

        # (Definição dos Prompts - MANTIDO IGUAL AO ANTERIOR)
        if depth == "initial":
            response_schema = {
                "type": "object",
                "properties": {
                    "definition": {"type": "string"},
                    "origin": {"type": "string"},
                    "pain_point": {"type": "string"},
                    "when_to_use": {"type": "string"},
                    "when_not_to_use": {"type": "string"},
                },
                "required": ["definition", "origin", "pain_point", "when_to_use", "when_not_to_use"]
            }
            user_prompt = f"Analise o termo técnico: '{topic}'. Responda em Português do Brasil."
        else: 
            response_schema = {
                "type": "object",
                "properties": {
                    "edge_cases": {"type": "string"},
                    "real_example": {"type": "string"},
                },
                "required": ["edge_cases", "real_example"]
            }
            user_prompt = f"Aprofunde no termo: '{topic}'. Casos raros e exemplo prático em Português."

        try:
            # Configuração da IA
            generation_config = {
                "temperature": 0.4,
                "response_mime_type": "application/json",
                "response_schema": response_schema
            }

            model = genai.GenerativeModel(
                model_name="gemini-2.0-flash",
                system_instruction="Você é um Arquiteto de Software Sênior.",
                generation_config=generation_config
            )
            
            response = model.generate_content(user_prompt)
            json_data = json.loads(response.text)

            # ====================================================
            # 💾 GUARDAR A RESPOSTA (Salvar como Flashcard/Cache)
            # ====================================================
            print("💾 Salvando novo conhecimento no Cache...")
            TopicCache.objects.create(
                topic=clean_topic,
                depth=depth,
                data=json_data
            )
            
            return json_data

        except Exception as e:
            print(f"❌ ERRO AI SERVICES: {e}")
            return {"error": f"Falha na análise: {str(e)}"}