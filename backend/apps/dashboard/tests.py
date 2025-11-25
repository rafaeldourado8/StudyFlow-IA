from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import Task

User = get_user_model()

class TaskCRUDTest(APITestCase):
    def setUp(self):
        # 1. Cria dois usuários (para testar isolamento)
        self.user = User.objects.create_user(email="user@test.com", password="password123", name="User One")
        self.other_user = User.objects.create_user(email="other@test.com", password="password123", name="User Two")
        
        # 2. Autentica como o primeiro usuário
        self.client.force_authenticate(user=self.user)
        
        # 3. Cria algumas tarefas no banco
        self.task1 = Task.objects.create(user=self.user, title="Estudar Django", status="pending")
        self.task2 = Task.objects.create(user=self.other_user, title="Tarefa do Outro", status="pending") # Não deve ser vista

        self.list_url = reverse('task-list') # /api/dashboard/tasks/

    def test_create_task(self):
        """Testa se consegue criar uma tarefa"""
        data = {
            "title": "Nova Tarefa",
            "description": "Testando criação",
            "priority": "high"
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.filter(user=self.user).count(), 2)

    def test_list_tasks_isolation(self):
        """Testa se o usuário vê APENAS as tarefas dele"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Deve retornar 1 tarefa (a dele), não 2
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], "Estudar Django")

    def test_update_task(self):
        """Testa atualizar status da tarefa"""
        url = reverse('task-detail', args=[self.task1.id])
        data = {"status": "completed"}
        
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.task1.refresh_from_db()
        self.assertTrue(self.task1.completed) # No Model, completed=True se status!=pending? Ajuste conforme sua lógica ou use o campo status direto.
        # Se o seu model tem campo 'completed' booleano separado do status, lembre de atualizar os dois ou um só.
        # Assumindo que você atualizou o serializer para aceitar 'status'.

    def test_delete_task(self):
        """Testa deletar tarefa"""
        url = reverse('task-detail', args=[self.task1.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Task.objects.filter(id=self.task1.id).count(), 0)

    def test_cannot_access_other_user_task(self):
        """Tenta acessar/deletar tarefa de outro usuário"""
        url = reverse('task-detail', args=[self.task2.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND) # O Django filtra no queryset, então dá 404, não 403