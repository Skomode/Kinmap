import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Clock, MapPin, X } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';

const LoginFormComp = () => {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [location, setLocation] = useState('Obteniendo ubicación...');
  const [isNotificationsActive, setIsNotificationsActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    // Obtener geolocalización
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`);
              const data = await response.json();
              const city = data.city || data.locality || data.principalSubdivision || 'Ubicación desconocida';
              setLocation(city);
            } catch (error) {
              setLocation('Error al obtener ubicación');
            }
          },
          (error) => {
            switch(error.code) {
              case error.PERMISSION_DENIED:
                setLocation('Acceso denegado');
                break;
              case error.POSITION_UNAVAILABLE:
                setLocation('Ubicación no disponible');
                break;
              case error.TIMEOUT:
                setLocation('Tiempo agotado');
                break;
              default:
                setLocation('Error desconocido');
                break;
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        setLocation('Geolocalización no soportada');
      }
    };

    getLocation();
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (errorMessage) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        setTimeout(() => setErrorMessage(''), 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleLogin = async () => {
    // Validar campos vacíos
    if (!loginForm.email || !loginForm.password) {
      setErrorMessage('Por favor, completa todos los campos');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginForm)
      });

      const data = await res.json();

      if (res.ok) {
        console.log('Login exitoso:', data);
        localStorage.setItem('token', data.token);
        navigate('/home');
      } else {
        setErrorMessage(data.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      setErrorMessage('No se pudo conectar con el servidor');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const toggleNotifications = () => {
    setIsNotificationsActive(!isNotificationsActive);
  };

  const handleRegisterNav = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50">
      <style>
        {`
          @keyframes slideDown {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(-100%); opacity: 0; }
          }
          .animate-slideDown {
            animation: slideDown 0.3s ease-out forwards;
          }
          .animate-slideUp {
            animation: slideUp 0.3s ease-out forwards;
          }
        `}
      </style>
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-700 rounded-2xl p-6 mb-6 shadow-lg">
              <div className="flex items-center justify-center mb-3">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white shadow-sm">
                  <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">K</span>
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Kinmap
              </h1>
              <p className="text-white/90 text-sm mt-1">
                Mantente conectado y seguro con quienes más quieres
              </p>
            </div>
          </div>

          {/* Formulario de login */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Teléfono, usuario o correo electrónico"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleLogin}
                disabled={!loginForm.email || !loginForm.password}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Iniciar sesión
              </button>
            </div>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500 font-semibold">O</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <div className="text-center">
              <button className="text-blue-500 text-sm hover:text-blue-700 transition-colors">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          {/* Mensaje de error */}
          {errorMessage && (
            <div
              className={`fixed top-5 right-5 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg text-sm flex items-center space-x-3
                ${showError ? 'animate-slideDown' : 'animate-slideUp'}`}
            >
              <span>{errorMessage}</span>
              <button onClick={() => setShowError(false)} className="hover:text-gray-200">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mt-4">
            <div className="text-center">
              <span className="text-sm text-gray-700">
                ¿No tienes una cuenta?{' '}
                <button className="text-blue-500 font-semibold hover:text-blue-700 transition-colors" onClick={handleRegisterNav}>
                  Regístrate
                </button>
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-xs">
              Obtén la aplicación.
            </p>
            <div className="flex justify-center space-x-2 mt-3">
              <div className="bg-black text-white px-4 py-2 rounded-lg text-xs">
                App Store
              </div>
              <div className="bg-black text-white px-4 py-2 rounded-lg text-xs">
                Google Play
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginFormComp;