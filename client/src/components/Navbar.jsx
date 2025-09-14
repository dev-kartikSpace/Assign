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
    <nav className="bg-gradient-to-r from-indigo-700 to-indigo-800 text-white shadow-xl sticky top-0 z-50 border-b border-indigo-900">
      <div className="container mx-auto flex justify-between items-center py-3 px-6">
        <h1 className="text-2xl font-extrabold tracking-wide select-none cursor-default font-sans">
          {user ? `Hello, ${user.name}` : 'Hello, Guest'}
        </h1>
        <div className="flex items-center space-x-4">
          {canGoBack && (
            <button
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="flex items-center space-x-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 focus:ring-4 focus:ring-teal-400 focus:outline-none rounded-2xl font-semibold shadow-md transition duration-300"
              type="button"
            >
              <span className="text-lg select-none">←</span>
              <span>Back</span>
            </button>
          )}
          {user && (
            <button
              onClick={handleLogout}
              aria-label="Logout"
              className="flex items-center space-x-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 focus:ring-4 focus:ring-amber-400 focus:outline-none rounded-2xl font-semibold shadow-md transition duration-300"
              type="button"
            >
              <span>Logout</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
