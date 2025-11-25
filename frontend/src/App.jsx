import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { TasksProvider } from './hooks/useTasks';
import MovingBackground from './components/layout/MovingBackground';
import Navigation from './components/layout/Navigation';
import LoginForm from './components/auth/LoginForm';
import TaskList from './components/tasks/TaskList';
import NeuralGraph from './components/neural/NeuralGraph';
import ChatInterface from './components/ai/ChatInterface';

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
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <NeuralGraph />
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
              <Navigation />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <div className="min-h-screen p-4 pb-20 relative z-10">
                <h1 className="text-3xl font-bold text-white">Profile</h1>
                {/* Profile content here */}
              </div>
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