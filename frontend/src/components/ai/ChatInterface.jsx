import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GradientButton from '../ui/GradientButton';

const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI tutor. How can I help you with your studies today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: message,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: messages.length + 2,
        text: "I understand your question. Let me help you break this down into manageable parts...",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
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
                <p className="text-white text-sm">{msg.text}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </GlassCard>
            </div>
          </motion.div>
        ))}
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
              className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus:outline-none"
            />
            <GradientButton
              type="submit"
              disabled={!message.trim()}
              className="p-3"
            >
              <Send className="w-4 h-4" />
            </GradientButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default ChatInterface;