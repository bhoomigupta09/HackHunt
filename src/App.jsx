import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import HackathonDetail from './pages/HackathonDetail';
import Organiser from './pages/Organiser';
import Admin from './pages/Admin';
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from './pages/UserDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LoginUser from './pages/LoginUser';
import LoginOrganizer from './pages/LoginOrganizer';
import LoginAdmin from './pages/LoginAdmin';
import SignupUser from './pages/SignupUser';
import SignupOrganizer from './pages/SignupOrganizer';
import SignupAdmin from './pages/SignupAdmin';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="hackathon/:id" element={<HackathonDetail />} />
          <Route path="Organiser" element={<Organiser />} />
          <Route path="/Admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
        
        {/* Role-specific Login Pages */}
        <Route path="/login-user" element={<LoginUser />} />
        <Route path="/login-organizer" element={<LoginOrganizer />} />
        <Route path="/login-admin" element={<LoginAdmin />} />
        
        {/* Role-specific Signup Pages */}
        <Route path="/signup-user" element={<SignupUser />} />
        <Route path="/signup-organizer" element={<SignupOrganizer />} />
        <Route path="/signup-admin" element={<SignupAdmin />} />
        
        {/* Role-specific Dashboards - No Layout */}
        <Route path="/dashboard/user" element={<UserDashboard />} />
        <Route path="/dashboard/organizer" element={<OrganizerDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
