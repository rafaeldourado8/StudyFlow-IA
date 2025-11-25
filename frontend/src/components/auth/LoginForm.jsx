import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GradientButton from '../ui/GradientButton';
import { useAuth } from '../../hooks/useAuth';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
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
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1 
              className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Welcome Back
            </motion.h1>
            <p className="text-gray-400">Continue your learning journey</p>
          </div>

          {/* Google Auth Button */}
          <motion.button
            className="w-full bg-gray-900/50 hover:bg-gray-800/50 text-white font-medium py-3 px-4 rounded-xl border border-white/10 transition-all duration-300 flex items-center justify-center gap-3 mb-6"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <span className="text-gray-900 font-bold text-sm">G</span>
            </div>
            Continue with Google
          </motion.button>

          {/* Divider */}
          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm">or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="Enter your password"
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

            {/* Submit Button */}
            <GradientButton
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Signing in...' : 'Log in'}
            </GradientButton>
          </form>

          {/* Signup Link */}
          <p className="text-center mt-6 text-gray-400">
            Don't have an account?{' '}
            <button className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
              Sign up
            </button>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default LoginForm;