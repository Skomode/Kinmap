import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Clock, MapPin, Check, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RegisterFormComp = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  );
  const [location, setLocation] = useState("Obteniendo ubicación...");
  const [isNotificationsActive, setIsNotificationsActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`
              );
              const data = await response.json();
              const city =
                data.city ||
                data.locality ||
                data.principalSubdivision ||
                "Ubicación desconocida";
              setLocation(city);
            } catch (error) {
              setLocation("Error al obtener ubicación");
            }
          },
          (error) => {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                setLocation("Acceso denegado");
                break;
              case error.POSITION_UNAVAILABLE:
                setLocation("Ubicación no disponible");
                break;
              case error.TIMEOUT:
                setLocation("Tiempo agotado");
                break;
              default:
                setLocation("Error desconocido");
                break;
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      } else {
        setLocation("Geolocalización no soportada");
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
        setTimeout(() => setErrorMessage(""), 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const passwordRequirements = {
    length: registerForm.password.length >= 8,
    uppercase: /[A-Z]/.test(registerForm.password),
    lowercase: /[a-z]/.test(registerForm.password),
    number: /\d/.test(registerForm.password),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(
    (req) => req
  );
  const passwordsMatch =
    registerForm.password === registerForm.confirmPassword &&
    registerForm.confirmPassword !== "";
  const isFormValid =
    registerForm.firstName &&
    registerForm.lastName &&
    registerForm.email &&
    isPasswordValid &&
    passwordsMatch &&
    acceptTerms;

  const handleRegister = async () => {
    if (isFormValid) {
      setErrorMessage("");
      try {
        const res = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: registerForm.firstName,
            lastName: registerForm.lastName,
            email: registerForm.email,
            password: registerForm.password,
            phone: registerForm.phone,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          console.log("✅ Registro exitoso:", data);
          localStorage.setItem("token", data.token);
          navigate("/home");
        } else {
          setErrorMessage(data.error || "No se pudo registrar");
        }
      } catch (error) {
        setErrorMessage("Error de conexión con el servidor");
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && isFormValid) {
      handleRegister();
    }
  };

  const toggleNotifications = () => {
    setIsNotificationsActive(!isNotificationsActive);
  };

  const handleGoToLogin = () => {
    navigate("/");
  };

  const RequirementIndicator = ({ met, text }) => (
    <div
      className={`flex items-center text-xs transition-colors duration-200 ${
        met ? "text-green-600" : "text-gray-500"
      }`}
    >
      {met ? (
        <Check className="w-3 h-3 mr-1" />
      ) : (
        <X className="w-3 h-3 mr-1" />
      )}
      {text}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50">
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-700 rounded-2xl p-4 mb-4 shadow-lg">
              <div className="flex items-center justify-center mb-2">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm">
                  <span className="text-xl font-extrabold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                    K
                  </span>
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Kinmap
              </h1>
              <p className="text-white/90 text-xs mt-1">
                Únete para mantenerte seguro
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5">
            <div className="text-center mb-4">
              <p className="text-gray-600 text-sm font-semibold">
                Regístrate para ver fotos y videos de tus amigos y familiares.
              </p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={registerForm.firstName}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      firstName: e.target.value,
                    })
                  }
                  onKeyPress={handleKeyPress}
                  className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <input
                  type="text"
                  placeholder="Apellido"
                  value={registerForm.lastName}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      lastName: e.target.value,
                    })
                  }
                  onKeyPress={handleKeyPress}
                  className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <input
                type="email"
                placeholder="Correo electrónico"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, email: e.target.value })
                }
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />

              <input
                type="tel"
                placeholder="Número de teléfono (opcional)"
                value={registerForm.phone}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, phone: e.target.value })
                }
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      password: e.target.value,
                    })
                  }
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {registerForm.password && (
                <div className="bg-gray-50 p-2 rounded-lg space-y-1">
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    Requisitos:
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    <RequirementIndicator
                      met={passwordRequirements.length}
                      text="8+ caracteres"
                    />
                    <RequirementIndicator
                      met={passwordRequirements.uppercase}
                      text="Mayúscula"
                    />
                    <RequirementIndicator
                      met={passwordRequirements.lowercase}
                      text="Minúscula"
                    />
                    <RequirementIndicator
                      met={passwordRequirements.number}
                      text="Número"
                    />
                  </div>
                </div>
              )}

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmar contraseña"
                  value={registerForm.confirmPassword}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  onKeyPress={handleKeyPress}
                  className={`w-full px-3 py-2.5 bg-gray-50 border rounded-lg text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    registerForm.confirmPassword && !passwordsMatch
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {registerForm.confirmPassword && (
                <div
                  className={`flex items-center text-xs transition-colors duration-200 ${
                    passwordsMatch ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {passwordsMatch ? (
                    <Check className="w-3 h-3 mr-1" />
                  ) : (
                    <X className="w-3 h-3 mr-1" />
                  )}
                  {passwordsMatch
                    ? "Las contraseñas coinciden"
                    : "Las contraseñas no coinciden"}
                </div>
              )}

              <div className="flex items-start space-x-2 mt-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                />
                <label
                  htmlFor="terms"
                  className="text-xs text-gray-600 leading-relaxed"
                >
                  Al registrarte, aceptas nuestros{" "}
                  <button className="text-blue-500 hover:text-blue-700 font-medium">
                    términos
                  </button>{" "}
                  y{" "}
                  <button className="text-blue-500 hover:text-blue-700 font-medium">
                    política de privacidad
                  </button>
                  .
                </label>
              </div>

              {errorMessage && (
                <div
                  className={`fixed top-5 right-5 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg text-sm flex items-center space-x-3
      ${showError ? "animate-slideDown" : "animate-slideUp"}`}
                >
                  <span>{errorMessage}</span>
                  <button
                    onClick={() => setShowError(false)}
                    className="hover:text-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleRegister}
                disabled={!isFormValid}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Registrarse
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mt-4">
            <div className="text-center">
              <span className="text-sm text-gray-700">
                ¿Ya tienes una cuenta?{" "}
                <button
                  onClick={handleGoToLogin}
                  className="text-blue-500 font-semibold hover:text-blue-700 transition-colors"
                >
                  Inicia sesión
                </button>
              </span>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-500 text-xs">Obtén la aplicación.</p>
            <div className="flex justify-center space-x-2 mt-2">
              <div className="bg-black text-white px-3 py-1.5 rounded-lg text-xs">
                App Store
              </div>
              <div className="bg-black text-white px-3 py-1.5 rounded-lg text-xs">
                Google Play
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterFormComp;
