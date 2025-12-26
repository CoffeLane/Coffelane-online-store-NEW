import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AdminRoute({ children }) {
  const { user, isAdmin } = useSelector((state) => state.auth);
  
  // Разрешаем доступ, если пользователь авторизован и включен админский режим
  // или если у пользователя есть роль admin
  if (user && (isAdmin || user?.role === 'admin')) {
    return children;
  }
  
  // Если пользователь не авторизован, перенаправляем на главную
  return <Navigate to="/" replace />;
}



