import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { TasksProvider } from './hooks/useTasks';
import MovingBackground from './components/layout/MovingBackground';
import Navigation from './components/layout/Navigation';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm'; // Novo
import TaskList from './components/tasks/TaskList';
import HomeDashboard from './components/dashboard/HomeDashboard'; 
import ChatInterface from './components/ai/ChatInterface';
import Profile from './components/profile/Profile';
import { UIProvider } from './hooks/useUI';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/" />;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-void text-white">
      <MovingBackground />
      
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