import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { TasksProvider } from './hooks/useTasks';
import MovingBackground from './components/layout/MovingBackground';
import Navigation from './components/layout/Navigation';
import LoginForm from './components/auth/LoginForm';
import TaskList from './components/tasks/TaskList';
import HomeDashboard from './components/dashboard/HomeDashboard'; 
import ChatInterface from './components/ai/ChatInterface';
import Profile from './components/profile/Profile';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/" />;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-void text-white">
      <MovingBackground />
      
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          } 
        />
        
        {/* Protected Routes */}
        
        {/* Home - Dashboard Principal */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <HomeDashboard /> 
              <Navigation />
            </ProtectedRoute>
          } 
        />
        
        {/* Conhecimentos - Lista de Tarefas */}
        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute>
              <TaskList />
              <Navigation />
            </ProtectedRoute>
          } 
        />
        
        {/* Arena / AI - Chat Interface */}
        <Route 
          path="/ai" 
          element={
            <ProtectedRoute>
              <ChatInterface />
              {/* Navigation removido aqui pois o Chat tem controle próprio ou layout específico */}
            </ProtectedRoute>
          } 
        />
        
        {/* Perfil - Nova Tela de Perfil */}
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
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <TasksProvider>
          <AppContent />
        </TasksProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;