import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google'; // Importante!
import { Link } from 'react-router-dom';
import GlassCard from '../ui/GlassCard';
import GradientButton from '../ui/GradientButton';
import { useAuth } from '../../hooks/useAuth';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithGoogle, isLoading } = useAuth();

  // --- Lógica do Google ---
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      // O backend espera o 'code' para trocar pelo token (Flow: auth-code)
      await loginWithGoogle(codeResponse.code);
    },
    onError: () => setError('Falha ao conectar com Google'),
    flow: 'auth-code', // Importante para django-allauth
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8" hover={true}>
          <div className="text-center mb-8">
            <motion.h1 
              className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2"
            >
              Bem-vindo de volta
            </motion.h1>
            <p className="text-gray-400">Continue seu fluxo de estudos</p>
          </div>

          {/* Google Auth Button */}
          <motion.button
            onClick={() => handleGoogleLogin()}
            className="w-full bg-gray-900/50 hover:bg-gray-800/50 text-white font-medium py-3 px-4 rounded-xl border border-white/10 transition-all duration-300 flex items-center justify-center gap-3 mb-6"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
          >
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <span className="text-gray-900 font-bold text-sm">G</span>
            </div>
            Entrar com Google
          </motion.button>

          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm">ou</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="Seu email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="Sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <GradientButton
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </GradientButton>
          </form>

          <p className="text-center mt-6 text-gray-400 text-sm">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-purple-400 hover:text-purple-300 transition-colors font-bold hover:underline">
              Cadastre-se
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default LoginForm;