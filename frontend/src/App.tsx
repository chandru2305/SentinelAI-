import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedLayout from './layouts/auth/ProtectedLayout';
import LoginPage from './pages/auth/LoginPage';
import MePage from './pages/auth/MePage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/me" element={<MePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
