import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5001/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setError(null);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto min-h-screen flex items-center">
      <form onSubmit={onSubmit} className="w-full bg-white rounded shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Login</h1>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <input className="w-full border px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <input className="w-full border px-3 py-2" placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        <button className="w-full bg-blue-600 text-white py-2 rounded" type="submit">Login</button>
        <p className="text-sm">No account? <Link className="text-blue-600" to="/signup">Sign up</Link></p>
      </form>
    </div>
  );
}

