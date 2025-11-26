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
        self.url = reverse('ask-tutor')

    # Mockamos o genai.GenerativeModel
    @patch('apps.ai_tutor.services.genai.GenerativeModel') 
    def test_ask_tutor_success(self, mock_model_class):
        """Testa o fluxo de pergunta para o Gemini com sucesso (Mockado)"""
        
        # 1. Configura o Mock
        mock_instance = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "Esta é uma resposta simulada do Gemini."
        
        mock_instance.generate_content.return_value = mock_response
        mock_model_class.return_value = mock_instance # Quando instanciar GenerativeModel, devolve nosso mock

        # 2. Faz a requisição
        payload = {"question": "O que é Python?", "subject": "Programação"}
        response = self.client.post(self.url, payload)

        # 3. Verifica
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['answer'], "Esta é uma resposta simulada do Gemini.")

    def test_ask_tutor_unauthenticated(self):
        self.client.logout()
        response = self.client.post(self.url, {"question": "Ola"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)