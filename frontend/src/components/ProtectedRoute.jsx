import { Navigate, Outlet } from 'react-router-dom';

/**
 * Component that prevents non users from going to different pages for logged users and prevents users from accesing admin pages.
 * @param {boolean} isAdminRequired value indicating whether user needs to be admin to access certain page
 */
const ProtectedRoute = ({ isAdminRequired }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const isAuthenticated = !!token;
  const isAdmin = role === 'ADMIN';

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (isAdminRequired && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;