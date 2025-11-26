import { useState, useEffect, useContext, createContext } from 'react';
import api from '../services/api';

const TasksContext = createContext();

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};

export const TasksProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Helper para normalizar a tarefa (adiciona o campo 'completed' baseado no status)
  const normalizeTask = (task) => ({
    ...task,
    completed: task.status === 'completed'
  });

  // Fetch tasks from backend
  const fetchTasks = async () => {
    // Se não tiver token, nem tenta buscar (evita erro 401 no console ao iniciar deslogado)
    if (!localStorage.getItem('access_token')) return;
    
    setIsLoading(true);
    try {
      const response = await api.get('/api/dashboard/tasks/');
      // Django REST com paginação retorna { count: ..., results: [...] }
      // Se a paginação estiver desligada, retorna [...] direto.
      const rawData = response.data.results || response.data;
      
      // Normaliza os dados para o frontend entender o 'completed'
      const normalizedTasks = rawData.map(normalizeTask);
      
      setTasks(normalizedTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new task
  const addTask = async (title) => {
    try {
      const response = await api.post('/api/dashboard/tasks/', { 
        title,
        status: 'pending' // Define status inicial explícito
      });
      
      // Normaliza a resposta antes de adicionar ao estado
      const newTask = normalizeTask(response.data);
      
      // Adiciona a nova tarefa no topo da lista
      setTasks(prev => [newTask, ...prev]);
    } catch (error) {
      console.error('Failed to add task:', error);
      throw error;
    }
  };

  // Toggle task completion
  const toggleTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Lógica para alternar entre 'completed' e 'pending'
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';

    try {
      // Usamos PATCH para atualizar parcialmente apenas o campo status
      const response = await api.patch(`/api/dashboard/tasks/${taskId}/`, {
        status: newStatus
      });

      // Normaliza a tarefa atualizada vinda do backend
      const updatedTask = normalizeTask(response.data);

      // Atualiza o estado local
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/api/dashboard/tasks/${taskId}/`);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const value = {
    tasks,
    isLoading,
    addTask,
    toggleTask,
    deleteTask,
    refreshTasks: fetchTasks,
  };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
};