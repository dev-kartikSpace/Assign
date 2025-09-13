import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import Home from './pages/Home.jsx';
import WorkspacePage from './pages/WorkspacePage.jsx';
import BoardPage from './pages/BoardPage.jsx';

const router = createBrowserRouter([
  { path: '/', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/home', element: <Home /> },
  { path: '/workspace/:workspaceId', element: <WorkspacePage /> },
  { path: '/board/:boardId', element: <BoardPage /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
