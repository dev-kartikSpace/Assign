import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const AuthForm = ({ isSignup }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = `http://localhost:5001/api/auth/${isSignup ? 'signup' : 'login'}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      login(data.user, data.token);
      navigate('/workspaces');
    } catch (err) {
      toast.error(err.message, { position: 'bottom-right' });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-900">
      <div className="bg-white bg-opacity-90 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-4xl font-extrabold text-center text-indigo-900 mb-8 select-none">
          {isSignup ? 'Create an Account' : 'Welcome Back'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignup && (
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-indigo-800 mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-4 border border-indigo-300 rounded-lg focus:ring-4 focus:ring-indigo-400 focus:outline-none text-indigo-900 transition"
                required
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-indigo-800 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-4 border border-indigo-300 rounded-lg focus:ring-4 focus:ring-indigo-400 focus:outline-none text-indigo-900 transition"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-indigo-800 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-4 border border-indigo-300 rounded-lg focus:ring-4 focus:ring-indigo-400 focus:outline-none text-indigo-900 transition"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition duration-300"
          >
            {isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <p className="mt-6 text-center text-indigo-900 text-sm select-none">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
          <a
            href={isSignup ? '/login' : '/signup'}
            className="text-indigo-600 hover:text-indigo-700 hover:underline ml-1 font-semibold transition"
          >
            {isSignup ? 'Login' : 'Sign Up'}
          </a>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
