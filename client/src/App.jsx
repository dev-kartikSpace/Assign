import { Routes, Route, Navigate } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import Workspaces from './components/Workspaces';
import BoardsHome from './components/BoardsHome';
import BoardView from './components/BoardView';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

const App = () => {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/workspaces" /> : <AuthForm isSignup={false} />} />
      <Route path="/signup" element={user ? <Navigate to="/workspaces" /> : <AuthForm isSignup={true} />} />
      <Route path="/workspaces" element={user ? <Workspaces /> : <Navigate to="/login" />} />
      <Route path="/workspaces/:workspaceId/boards" element={user ? <BoardsHome /> : <Navigate to="/login" />} />
      <Route path="/boards/:boardId" element={user ? <BoardView /> : <Navigate to="/login" />} />
      <Route path="/" element={<Navigate to={user ? "/workspaces" : "/login"} />} />
    </Routes>
  );
};

export default App;