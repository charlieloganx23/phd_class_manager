import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Classes from './pages/Classes';
import Teachers from './pages/Teachers';
import Groups from './pages/Groups';
import Students from './pages/Students';
import Substitutions from './pages/Substitutions';
import Notifications from './pages/Notifications';
import ProfessorArea from './pages/ProfessorArea';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/aulas"
            element={
              <PrivateRoute>
                <Classes />
              </PrivateRoute>
            }
          />
          <Route
            path="/professores"
            element={
              <PrivateRoute requiredRole="admin">
                <Teachers />
              </PrivateRoute>
            }
          />
          <Route
            path="/turmas"
            element={
              <PrivateRoute requiredRole="admin">
                <Groups />
              </PrivateRoute>
            }
          />
          <Route
            path="/alunos"
            element={
              <PrivateRoute requiredRole="admin">
                <Students />
              </PrivateRoute>
            }
          />
          <Route
            path="/substituicoes"
            element={
              <PrivateRoute requiredRole="admin">
                <Substitutions />
              </PrivateRoute>
            }
          />
          <Route
            path="/notificacoes"
            element={
              <PrivateRoute requiredRole="admin">
                <Notifications />
              </PrivateRoute>
            }
          />
          <Route
            path="/professor"
            element={
              <PrivateRoute requiredRole="professor">
                <ProfessorArea />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
