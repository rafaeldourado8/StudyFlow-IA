import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import GlassCard from '../ui/GlassCard.jsx';
import GradientButton from '../ui/GradientButton.jsx';
import { aiService } from '../../services/ai.js'; // Importando o serviço real

const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI tutor. How can I help you with your studies today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessageText = message;

    // 1. Add user message immediately
    const userMessage = {
      id: Date.now(),
      text: userMessageText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // 2. Send to backend
      const data = await aiService.sendMessage(userMessageText);

      // 3. Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        text: data.answer, // Backend returns 'answer'
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("Failed to get AI response", error);
      const errorMessage = {
        id: Date.now() + 2,
        text: "Sorry, I'm having trouble connecting to my brain right now. Please try again later.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 pb-24 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-white mb-2">AI Tutor</h1>
        <p className="text-gray-400">Your personal learning assistant</p>
      </motion.div>

      {/* Chat Messages */}
      <div className="space-y-4 mb-20">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start gap-3 max-w-[80%] ${msg.isUser ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                msg.isUser 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                  : 'bg-purple-500/20 border border-purple-500/30'
              }`}>
                {msg.isUser ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-purple-300" />
                )}
              </div>
              
              <GlassCard className={`p-4 ${msg.isUser ? 'bg-white/10' : 'bg-purple-900/20'}`}>
                <p className="text-white text-sm whitespace-pre-wrap">{msg.text}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </GlassCard>
            </div>
          </motion.div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex justify-start"
          >
            <div className="flex items-center gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-500/20 border border-purple-500/30">
                <Bot className="w-4 h-4 text-purple-300" />
              </div>
              <GlassCard className="p-4 bg-purple-900/20 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </div>

      {/* Message Input */}
      <div className="fixed bottom-20 left-4 right-4 z-30">
        <GlassCard className="p-3">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything about your studies..."
              className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus:outline-none disabled:opacity-50"
              disabled={isLoading}
            />
            <GradientButton
              type="submit"
              disabled={!message.trim() || isLoading}
              className="p-3 flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </GradientButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default ChatInterface;