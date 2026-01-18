import { Navigate } from 'react-router-dom';

const isAuthenticated = () => {
  const token = localStorage.getItem('token');

  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp && payload.exp * 1000 < Date.now();
    return !isExpired;
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return false;
  }
};

const PublicRoute = ({ element }) => {
  return isAuthenticated() ? <Navigate to="/home" replace /> : element;
};

export default PublicRoute;
