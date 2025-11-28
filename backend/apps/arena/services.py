import os
import json
import re
import logging
import google.generativeai as genai
import google.api_core.exceptions
from django.conf import settings
from django.core.exceptions import ValidationError

logger = logging.getLogger(__name__)

class ArenaService:
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.is_configured = True
            logger.info("✅ Gemini API configurada com sucesso")
        else:
            self.is_configured = False
            logger.error("❌ GEMINI_API_KEY não encontrada")

    def validate_topic(self, topic: str):
        """
        Higieniza e valida o tópico para evitar SSRF/Prompt Injection via input.
        """
        # 1. Limite de tamanho
        if len(topic) > 100:
            raise ValidationError("Tópico muito longo.")
            
        # 2. Whitelist de caracteres (Permite letras, números, espaços e hifens)
        # Bloqueia caracteres especiais que poderiam ser usados em URLs ou comandos
        # Permite acentuação em português
        if not re.match(r'^[\w\s\-áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+$', topic):
            raise ValidationError("Tópico contém caracteres inválidos.")
        
        # 3. Blacklist de termos sensíveis de infraestrutura e protocolos
        blacklist = [
            "localhost", "127.0.0.1", "0.0.0.0", "metadata.google.internal", 
            "http:", "https:", "ftp:", "file:", "gopher:", "ldap:", "dict:"
        ]
        
        normalized_topic = topic.lower()
        if any(bad in normalized_topic for bad in blacklist):
            raise ValidationError("Tópico não permitido por segurança.")

    def generate_quiz(self, topic: str, difficulty: str = "medium") -> dict:
        """
        Gera um Quiz Gamificado usando o Gemini 1.5 Flash.
        
        Args:
            topic: Tópico do quiz
            difficulty: Nível de dificuldade (easy, medium, hard)
            
        Returns:
            dict com formato {"questions": [...]} ou {"error": "mensagem"}
        """
        if not self.is_configured:
            logger.error("API não configurada - verifique GEMINI_API_KEY")
            return {
                "error": "IA não configurada. Verifique a API KEY no servidor.",
                "questions": []
            }
        
        # [SEGURANÇA] Validação de Entrada antes de processar qualquer coisa
        try:
            self.validate_topic(topic)
        except ValidationError as e:
            logger.warning(f"⚠️ Tentativa de input inválido bloqueada: {topic}")
            return {
                "error": str(e.message),
                "questions": []
            }
        
        # Mapeia dificuldade para contexto mais rico
        difficulty_context = {
            "easy": "iniciante - conceitos básicos e fundamentais",
            "medium": "intermediário - aplicações práticas e melhores práticas",
            "hard": "avançado - otimizações, edge cases e arquitetura"
        }
        
        context = difficulty_context.get(difficulty.lower(), difficulty_context["medium"])
        
        # Prompt otimizado para JSON estruturado
        prompt = f"""
Você é um Game Master especializado em tecnologia.
Crie um quiz de 3 perguntas sobre: "{topic}"
Nível de dificuldade: {context}
Idioma: Português do Brasil (PT-BR)

Retorne APENAS um JSON válido neste formato exato:
{{
    "questions": [
        {{
            "id": 1,
            "text": "Qual conceito...",
            "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
            "correct_index": 0,
            "feedback_correct": "🎯 Mandou bem! Explicação curta...",
            "feedback_incorrect": "❌ Quase lá! Dica rápida...",
            "explanation": "Explicação técnica de 1-2 linhas"
        }}
    ]
}}

REGRAS OBRIGATÓRIAS:
- NÃO use markdown (```json)
- correct_index começa em 0
- Perguntas técnicas e práticas
- Feedbacks com emojis e linguagem descontraída
"""
        
        try:
            # Configuração para modo JSON
            generation_config = {
                "temperature": 0.7,
                "top_p": 0.95,
                "response_mime_type": "application/json"
            }
            
            # Usa o modelo estável (não o alias 'latest')
            model = genai.GenerativeModel(
                "gemini-2.0-flash",  # Modelo estável
                generation_config=generation_config
            )
            
            logger.info(f"🤖 Gerando quiz: topic={topic}, difficulty={difficulty}")
            response = model.generate_content(prompt)
            
            # Extrai o texto da resposta
            text_response = response.text.strip()
            logger.debug(f"Resposta bruta: {text_response[:200]}...")
            
            # Tenta parsear JSON diretamente
            try:
                quiz_data = json.loads(text_response)
                
                # Valida estrutura básica
                if "questions" not in quiz_data:
                    raise ValueError("Campo 'questions' não encontrado")
                
                if not isinstance(quiz_data["questions"], list):
                    raise ValueError("'questions' deve ser uma lista")
                
                logger.info(f"✅ Quiz gerado com {len(quiz_data['questions'])} perguntas")
                return quiz_data
                
            except json.JSONDecodeError as json_err:
                logger.warning(f"JSON malformado, tentando limpeza: {json_err}")
                
                # Fallback 1: Remove markdown code blocks
                cleaned = re.sub(r'```json\s*|\s*```', '', text_response)
                
                # Fallback 2: Extrai objeto JSON principal
                match = re.search(r'\{.*\}', cleaned, re.DOTALL)
                if match:
                    quiz_data = json.loads(match.group(0))
                    logger.info("✅ JSON extraído via regex")
                    return quiz_data
                
                # Fallback 3: Se encontrou array, envelopa
                match_arr = re.search(r'\[.*\]', cleaned, re.DOTALL)
                if match_arr:
                    quiz_data = {"questions": json.loads(match_arr.group(0))}
                    logger.info("✅ Array convertido para objeto")
                    return quiz_data
                
                raise ValueError("Não foi possível extrair JSON válido da resposta")
        
        except google.api_core.exceptions.NotFound as e:
            # Erro específico de modelo não encontrado
            logger.error(f"❌ Modelo não encontrado: {str(e)}")
            return {
                "error": "Modelo de IA indisponível. Entre em contato com o suporte.",
                "questions": []
            }
        
        except Exception as e:
            logger.exception(f"❌ Erro ao gerar quiz: {str(e)}")
            return {
                "error": f"Erro ao gerar quiz: {str(e)}",
                "questions": []
            }
    
    def validate_answer(self, question_data: dict, user_answer: int) -> dict:
        """
        Valida a resposta do usuário.
        
        Args:
            question_data: Dicionário com os dados da questão
            user_answer: Índice da resposta escolhida pelo usuário
            
        Returns:
            dict com is_correct, feedback e explanation
        """
        try:
            correct_index = question_data.get("correct_index", 0)
            is_correct = user_answer == correct_index
            
            return {
                "is_correct": is_correct,
                "feedback": (
                    question_data.get("feedback_correct", "Correto!") 
                    if is_correct 
                    else question_data.get("feedback_incorrect", "Incorreto!")
                ),
                "explanation": question_data.get("explanation", ""),
                "correct_answer": question_data["options"][correct_index]
            }
        except Exception as e:
            logger.error(f"Erro ao validar resposta: {str(e)}")
            return {
                "is_correct": False,
                "feedback": "Erro ao processar resposta",
                "explanation": "",
                "correct_answer": ""
            }