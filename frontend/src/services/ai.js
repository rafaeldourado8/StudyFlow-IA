import api from './api.js';

export const aiService = {
  /**
   * Envia uma pergunta para o Chat (Tutor).
   * Endpoint: /api/ai/ask/
   */
  async sendMessage(question, subject = 'Geral') {
    try {
      const response = await api.post('/api/ai/ask/', { 
        question, 
        subject 
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao falar com a IA:', error);
      throw error;
    }
  },

  /**
   * Envia um tópico para análise estruturada (Criação de Tarefa).
   * Endpoint: /api/ai/analyze/
   */
  async analyzeTask(topic, depth = 'initial') {
    try {
      const response = await api.post('/api/ai/analyze/', {
        topic,
        depth // 'initial' ou 'deep'
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao analisar tarefa:', error);
      throw error;
    }
  }
};