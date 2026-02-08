import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import RestaurantDetails from './pages/RestaurantDetails';
import VerifyEmail from './pages/VerifyEmail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BusinessDashboard from './pages/BusinessDashboard';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurant/:id" element={<RestaurantDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/business-dashboard" element={<BusinessDashboard />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
