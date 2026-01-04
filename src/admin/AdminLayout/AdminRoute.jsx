import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AdminRoute({ children }) {
  const { user, isAdmin } = useSelector((state) => state.auth);
  
  if (user && (isAdmin || user?.role === 'admin')) {
    return children;
  }
  return <Navigate to="/" replace />;
}




