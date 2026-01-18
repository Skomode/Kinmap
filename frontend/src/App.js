import { Routes, Route } from 'react-router-dom';
import DefaultPage from './pages/DefaultPage';
import Home from './pages/Home';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route
        path="/"
        element={<PublicRoute element={<DefaultPage />} />}
      />
      <Route
        path="/register"
        element={<PublicRoute element={<RegisterPage />} />}
      />

      {/* Rutas privadas */}
      <Route
        path="/home"
        element={<ProtectedRoute element={<Home />} />}
      />
    </Routes>
  );
}

export default App;
