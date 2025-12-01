// frontend/src/App.jsx - VERSÃO CORRIGIDA E OTIMIZADA
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
// CORREÇÃO AQUI: Adicionado 'useAuth' na importação
import { AuthProvider, useAuth } from './hooks/useAuth';
import { TasksProvider } from './hooks/useTasks';
import MovingBackground from './components/layout/MovingBackground';
import Navigation from './components/layout/Navigation';
import { UIProvider } from './hooks/useUI';
import OnboardingTutorial from './components/tutorial/OnboardingTutorial';
import SkeletonLoader from './components/ui/SkeletonLoader';

// Lazy loading para melhor performance
const LoginForm = lazy(() => import('./components/auth/LoginForm'));
const RegisterForm = lazy(() => import('./components/auth/RegisterForm'));
const TaskList = lazy(() => import('./components/tasks/TaskList'));
const HomeDashboard = lazy(() => import('./components/dashboard/HomeDashboard'));
const ChatInterface = lazy(() => import('./components/ai/ChatInterface'));
const Profile = lazy(() => import('./components/profile/Profile'));

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/" />;
};

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-void text-white">
      <MovingBackground />
      
      <Suspense fallback={<SkeletonLoader />}>
        <Routes>
          {/* Rotas Públicas */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginForm />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterForm />
              </PublicRoute>
            } 
          />
          
          {/* Rotas Protegidas */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <HomeDashboard /> 
                <Navigation />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <TaskList />
                <Navigation />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ai" 
            element={
              <ProtectedRoute>
                <ChatInterface />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
                <Navigation />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Suspense>

      {/* Tutorial aparece apenas para usuários autenticados */}
      {isAuthenticated && <OnboardingTutorial />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <UIProvider>
          <TasksProvider>
            <AppContent />
          </TasksProvider>
        </UIProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;