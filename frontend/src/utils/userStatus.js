export const computeIsActive = (lastLogin, timeoutMinutes = 5) => {
  if (!lastLogin) return false; // si nunca ha iniciado sesión
  const now = new Date();
  const diff = now - new Date(lastLogin); // diferencia en milisegundos
  return diff < timeoutMinutes * 60 * 1000; // true si ha estado activo en los últimos X minutos
};