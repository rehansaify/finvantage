import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layouts
import Layout from './components/layout/Layout';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import ForBanks from './pages/ForBanks';
import ForColleges from './pages/ForColleges';
import Pipeline from './pages/Pipeline';
import Contact from './pages/Contact';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// App Pages
import AppLayout from './components/app/AppLayout';
import CandidateDashboard from './pages/app/CandidateDashboard';
import CorporateDashboard from './pages/app/CorporateDashboard';
import SourcingDashboard from './pages/app/SourcingDashboard';
import AdminDashboard from './pages/app/AdminDashboard';
import Unauthorized from './pages/app/Unauthorized';
import OrganizationSettings from './pages/app/OrganizationSettings';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public Marketing Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="for-banks" element={<ForBanks />} />
          <Route path="for-colleges" element={<ForColleges />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Authenticated App Routes (Phase 2B) */}
        <Route path="/app" element={<AppLayout />}>
          <Route path="candidate" element={<CandidateDashboard />} />
          <Route path="corporate" element={<CorporateDashboard />} />
          <Route path="sourcing" element={<SourcingDashboard />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="unauthorized" element={<Unauthorized />} />
          <Route path="settings" element={<OrganizationSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
