import os
import json
import google.generativeai as genai
from django.conf import settings
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
        """
        Retorna uma resposta socrática para o chat (String simples).
        """
        if not self.is_configured: return "Erro: API Key não configurada."
        try:
            model = genai.GenerativeModel("gemini-2.0-flash", system_instruction="Tutor Socrático. Ajude o aluno a pensar.")
            response = model.generate_content(f"{subject}: {question}")
            return response.text
        except Exception as e: return f"Erro IA: {str(e)}"

    def analyze_topic(self, topic: str, depth: str = "initial") -> dict:
        """
        Gera análise estruturada com estratégia Cache-Aside.
        Suporta depths: 'initial', 'deep', 'patterns', 'troubleshooting'
        """
        clean_topic = topic.strip().lower()
        # A chave de cache inclui o 'depth' para diferenciar os tipos de conteúdo
        cache_key = f"{clean_topic}_{depth}"

        print(f"🔍 Buscando cache para: {clean_topic} (Nível: {depth})")
        
        # 1. Tenta buscar no banco local
        cached_entry = TopicCache.objects.filter(topic=clean_topic, depth=depth).first()
        
        if cached_entry:
            print("⚡ CACHE HIT: Retornando dados do banco local.")
            return cached_entry.data

        # 2. Se não achar, consulta a IA
        print("🤖 CACHE MISS: Consultando Gemini IA...")
        
        if not self.is_configured:
            return {"error": "IA não configurada"}

        # ====================================================
        # ⚙️ CONFIGURAÇÃO DINÂMICA DE PROMPTS E SCHEMAS
        # ====================================================
        configs = {
            "initial": {
                "prompt": f"Analise o termo técnico: '{topic}'. Responda em Português do Brasil com foco em fundamentos.",
                "schema": {
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
            },
            # Deep: Edge Cases e Detalhes Internos
            "deep": { 
                "prompt": f"Aprofunde no termo: '{topic}'. Foque em casos raros (edge cases) e limitações técnicas. Português BR.",
                "schema": {
                    "type": "object",
                    "properties": {
                        "edge_cases": {"type": "string", "description": "Situações extremas onde a tecnologia falha ou se comporta de forma inesperada"},
                        "advanced_detail": {"type": "string", "description": "Detalhe técnico interno de como funciona 'por baixo do capô'"},
                        "real_example": {"type": "string", "description": "Um cenário do mundo real complexo"},
                    },
                    "required": ["edge_cases", "advanced_detail", "real_example"]
                }
            },
            # Patterns: Arquitetura e Padrões
            "patterns": {
                "prompt": f"Quais os Design Patterns e arquiteturas comuns associados a '{topic}'? Português BR.",
                "schema": {
                    "type": "object",
                    "properties": {
                        "common_patterns": {"type": "string", "description": "Padrões de projeto comumente usados com essa tecnologia"},
                        "best_practices": {"type": "string", "description": "Boas práticas de arquitetura"},
                        "anti_patterns": {"type": "string", "description": "O que NÃO fazer (anti-padrões)"},
                    },
                    "required": ["common_patterns", "best_practices", "anti_patterns"]
                }
            },
            # Troubleshooting: Problemas do dia a dia
            "troubleshooting": {
                "prompt": f"Como Senior Engineer, liste os problemas mais comuns no dia a dia trabalhando com '{topic}' e como resolver. Português BR.",
                "schema": {
                    "type": "object",
                    "properties": {
                        "common_bugs": {"type": "string", "description": "Erros frequentes que iniciantes cometem"},
                        "debugging_tips": {"type": "string", "description": "Dicas de como debugar problemas nisso"},
                        "performance_impact": {"type": "string", "description": "Impactos de performance comuns"},
                    },
                    "required": ["common_bugs", "debugging_tips", "performance_impact"]
                }
            }
        }

        # Seleciona a configuração ou usa 'deep' como fallback seguro
        current_config = configs.get(depth, configs["deep"])

        try:
            generation_config = {
                "temperature": 0.4,
                "response_mime_type": "application/json",
                "response_schema": current_config["schema"]
            }

            model = genai.GenerativeModel(
                model_name="gemini-2.0-flash",
                system_instruction="Você é um Arquiteto de Software Sênior e Tutor Técnico.",
                generation_config=generation_config
            )
            
            response = model.generate_content(current_config["prompt"])
            json_data = json.loads(response.text)

            # 3. Salva no Cache
            print(f"💾 Salvando {depth} no Cache...")
            TopicCache.objects.create(
                topic=clean_topic,
                depth=depth,
                data=json_data
            )
            
            return json_data

        except Exception as e:
            print(f"❌ ERRO AI SERVICES: {e}")
            return {"error": f"Falha na análise: {str(e)}"}