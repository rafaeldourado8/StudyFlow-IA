import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Shield, LogOut, Edit2, Save, X, Calendar 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import GlassCard from '../ui/GlassCard';
import GradientButton from '../ui/GradientButton';
import AvatarSelector, { AVATARS } from './AvatarSelector';

const Profile = () => {
  const { user, logout } = useAuth();
  
  // Estado local para edição
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    avatarId: 'default'
  });

  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      // Tenta pegar do localStorage ou usa o do user context
      const savedAvatar = localStorage.getItem(`avatar_${user.email}`) || 'default';
      setFormData({
        name: user.name || 'Estudante',
        avatarId: savedAvatar
      });
    }
  }, [user]);

  const handleSave = () => {
    // AQUI: Em um cenário real, você faria um PATCH para /api/users/me/
    // Por enquanto, salvamos o Avatar no LocalStorage para persistir visualmente
    localStorage.setItem(`avatar_${user?.email}`, formData.avatarId);
    
    // Simula salvamento
    setIsEditing(false);
  };

  // Encontra o objeto do avatar atual para renderizar
  const currentAvatar = AVATARS.find(a => a.id === formData.avatarId) || AVATARS[0];
  const AvatarIcon = currentAvatar.icon;

  if (!user) return null;

  return (
    <div className="min-h-screen p-4 pb-24 relative z-10">
      
      {/* Header com Animação */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center mb-8 pt-4"
      >
        <div className="relative">
          {/* Avatar Grande */}
          <motion.div 
            className={`w-32 h-32 rounded-full bg-gradient-to-br ${currentAvatar.gradient} flex items-center justify-center shadow-2xl mb-4 border-4 border-white/10`}
            whileHover={{ scale: 1.05 }}
          >
            <AvatarIcon className="w-16 h-16 text-white" />
          </motion.div>
          
          {/* Badge de Cargo */}
          <div className="absolute bottom-4 right-0 bg-black/80 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full flex items-center gap-1">
            <Shield className="w-3 h-3 text-purple-400" />
            <span className="text-[10px] font-bold text-white uppercase">{user.role || 'Viewer'}</span>
          </div>
        </div>

        {/* Nome e Email */}
        <h1 className="text-2xl font-bold text-white text-center">{formData.name}</h1>
        <p className="text-gray-400 text-sm flex items-center gap-2 mt-1">
          <Mail className="w-3 h-3" /> {user.email}
        </p>
      </motion.div>

      {/* Cartão de Edição / Visualização */}
      <GlassCard className="p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" /> Detalhes da Conta
          </h3>
          
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-purple-300 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <button 
                onClick={handleSave}
                className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-300 transition-colors"
              >
                <Save className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Seletor de Avatar (Aparece só na edição) */}
          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-white/10 mb-4"
              >
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest">Escolha seu Avatar</p>
                <AvatarSelector 
                  selectedId={formData.avatarId} 
                  onSelect={(id) => setFormData({...formData, avatarId: id})} 
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Campo Nome */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500 ml-1">Nome de Exibição</label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={`
                w-full bg-black/20 border rounded-xl px-4 py-3 text-white transition-all
                ${isEditing ? 'border-purple-500/50 focus:border-purple-500' : 'border-white/5 text-gray-300'}
              `}
            />
          </div>

          {/* Campo Email (Readonly) */}
          <div className="space-y-1 opacity-60">
            <label className="text-xs text-gray-500 ml-1">Email (Não alterável)</label>
            <div className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed">
              {user.email}
            </div>
          </div>

          {/* Data de Entrada */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 px-1">
            <Calendar className="w-3 h-3" />
            Membro desde {new Date().getFullYear()}
          </div>
        </div>
      </GlassCard>

      {/* Botão de Logout */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6"
      >
        <button 
          onClick={logout}
          className="w-full py-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 font-medium flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all"
        >
          <LogOut className="w-4 h-4" /> Sair da Conta
        </button>
      </motion.div>

    </div>
  );
};

export default Profile;