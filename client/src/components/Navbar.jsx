import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const canGoBack =
    location.pathname !== '/workspaces' &&
    location.pathname !== '/login' &&
    location.pathname !== '/signup';

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <h1 className="text-2xl font-extrabold tracking-wide cursor-default select-none">
          Trello Clone
        </h1>
        <div className="flex items-center space-x-4">
          {canGoBack && (
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-indigo-500 bg-opacity-90 rounded-lg hover:bg-indigo-600 hover:bg-opacity-100 transition duration-300 font-semibold shadow-md"
              aria-label="Go back"
            >
              ← Back
            </button>
          )}
          {user && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition duration-300 font-semibold shadow-md"
              aria-label="Logout"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
