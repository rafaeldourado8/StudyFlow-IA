from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from unittest.mock import patch, MagicMock

User = get_user_model()

class AITutorTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="student@test.com", password="password123", name="Student")
        self.client.force_authenticate(user=self.user)
        self.url = reverse('ask-tutor') # /api/ai/ask/

    # O @patch intercepta a chamada para a OpenAI dentro do services.py
    @patch('apps.ai_tutor.services.OpenAI') 
    def test_ask_tutor_success(self, mock_openai):
        """Testa o fluxo de pergunta para a IA com sucesso (Mockado)"""
        
        # 1. Configura o Mock para retornar uma resposta falsa
        mock_client = MagicMock()
        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = "Esta é uma resposta simulada da IA."
        
        mock_client.chat.completions.create.return_value = mock_completion
        mock_openai.return_value = mock_client # Quando chamar OpenAI(), devolve nosso cliente falso

        # 2. Faz a requisição real para sua API
        payload = {"question": "O que é Python?", "subject": "Programação"}
        response = self.client.post(self.url, payload)

        # 3. Verifica se a API respondeu corretamente
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['answer'], "Esta é uma resposta simulada da IA.")

    def test_ask_tutor_unauthenticated(self):
        """Testa se bloqueia usuário não logado"""
        self.client.logout()
        response = self.client.post(self.url, {"question": "Ola"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)