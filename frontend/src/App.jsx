import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/auth/login/loginPage';
import HomePage from './pages/home/homePage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import NotificationPage from './pages/notification/notification';
import ProfilePage from './pages/profile/ProfilePage';

import Sidebar from './components/common/sideBar';
import RightPanel from './components/common/rightPanel';
function App() {
  return (
    <div className="flex max-w-6xl mx-auto">
      <Sidebar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
      </Routes>
      <RightPanel />
    </div>
  );
}

export default App;
