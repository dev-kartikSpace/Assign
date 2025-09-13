import { useNavigate } from 'react-router-dom';

export default function Logout() {
  const navigate = useNavigate();
  const onClick = () => {
    localStorage.removeItem('token');
    navigate('/');
  };
  return (
    <button className="px-3 py-1 bg-gray-200 rounded" onClick={onClick}>Logout</button>
  );
}

