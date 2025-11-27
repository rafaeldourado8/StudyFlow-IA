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

  const normalizeTask = (task) => ({
    ...task,
    completed: task.status === 'completed'
  });

  const fetchTasks = async () => {
    if (!localStorage.getItem('access_token')) return;
    
    setIsLoading(true);
    try {
      const response = await api.get('/api/dashboard/tasks/');
      // Correção: Lida com paginação (results) ou lista direta
      const rawData = response.data.results || response.data;
      
      // Validação de Segurança
      if (Array.isArray(rawData)) {
        const normalizedTasks = rawData.map(normalizeTask);
        setTasks(normalizedTasks);
      } else {
        console.warn('Formato inválido em fetchTasks:', rawData);
        setTasks([]);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (title) => {
    try {
      const response = await api.post('/api/dashboard/tasks/', { 
        title,
        status: 'pending'
      });
      const newTask = normalizeTask(response.data);
      setTasks(prev => [newTask, ...prev]);
    } catch (error) {
      console.error('Failed to add task:', error);
      throw error;
    }
  };

  const toggleTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';

    try {
      const response = await api.patch(`/api/dashboard/tasks/${taskId}/`, {
        status: newStatus
      });
      const updatedTask = normalizeTask(response.data);
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

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