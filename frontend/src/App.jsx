import { Route, Routes, Navigate } from 'react-router-dom';

import LoginPage from './pages/auth/login/loginPage';
import HomePage from './pages/home/homePage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import NotificationPage from './pages/notification/notification';
import ProfilePage from './pages/profile/ProfilePage';

import Sidebar from './components/common/sideBar';
import RightPanel from './components/common/rightPanel';
import  { Toaster } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from './components/common/LoadingSpinner';
// import EmojiPicker from 'emoji-picker-react';


function App() {
  const {
    data: authUser,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/v1/auth/me', {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.error) return null;
        if (!res.ok) {
          throw new Error(data.error || 'Something went wrong');
        }
        console.log('authUser is here:', data);
        // toast.success("Logged in successfully!");
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  });

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex justify-center items-center">
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    );
  }
  return (
    <div className="flex max-w-6xl mx-auto">
      {authUser && <Sidebar />}
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/notifications"
          element={authUser ? <NotificationPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile/:username"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
        {/* <Route path='/logout' element={<Navigate to='/login' />} /> */}
      </Routes>
      {authUser && <RightPanel />}
       {/* <EmojiPicker /> */}
      <Toaster />
    </div>
  );
}

export default App;
