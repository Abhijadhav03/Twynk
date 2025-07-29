import { Route, Routes } from 'react-router-dom';
import SignupPage from './pages/auth/signup/Signuppage';
function App() {
  return (
    <div className="flex max-w-6xl mx-auto">
      <Routes>
        {/* <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} /> */}
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </div>
  );
}

export default App;
