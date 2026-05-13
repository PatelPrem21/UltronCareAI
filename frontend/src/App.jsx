import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import EmergencyPage from './pages/EmergencyPage';

// Components
import Navbar from './components/Navbar';
import DoctorNavbar from './components/DoctorNavbar';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import EmergencyPublic from './pages/EmergencyPublic';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import PatientAppointments from './pages/patient/Appointments';
import PatientLabs from './pages/patient/LabReports';
import PatientPrescriptions from './pages/patient/Prescriptions';
import PatientChat from './pages/patient/Chat';
import PatientEmergency from './pages/patient/Emergency';

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorPatients from './pages/doctor/Patients';
import DoctorPatientProfile from './pages/doctor/PatientProfile';
import DoctorAddVisit from './pages/doctor/AddVisit';
import DoctorSchedule from './pages/doctor/Schedule';
import DoctorReports from './pages/doctor/Reports';

const ProtectedRoute = ({ allowedRole, children }) => {
  const { token, role } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }
  return children ? children : <Outlet />;
};

const PatientLayout = () => {
  return (
    <div className="min-h-screen bg-space-800 bg-particles relative">
      <Navbar />
      <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

const DoctorLayout = () => {
  return (
    <div className="min-h-screen bg-space-800 bg-particles relative">
      <DoctorNavbar />
      <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#0d1526', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* <Route path="/emergency/:id" element={<EmergencyPublic />} /> */}
        <Route path="/emergency/:patient_id" element={<EmergencyPage />} />

        {/* Patient Routes */}
        <Route element={<ProtectedRoute allowedRole="patient" />}>
          <Route element={<PatientLayout />}>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/appointments" element={<PatientAppointments />} />
            <Route path="/patient/labs" element={<PatientLabs />} />
            <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
            <Route path="/patient/chat" element={<PatientChat />} />
            <Route path="/patient/emergency" element={<PatientEmergency />} />
          </Route>
        </Route>

        {/* Doctor Routes */}
        <Route element={<ProtectedRoute allowedRole="doctor" />}>
          <Route element={<DoctorLayout />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/patients" element={<DoctorPatients />} />
            <Route path="/doctor/patients/:id" element={<DoctorPatientProfile />} />
            <Route path="/doctor/visit/new" element={<DoctorAddVisit />} />
            <Route path="/doctor/schedule" element={<DoctorSchedule />} />
            <Route path="/doctor/reports" element={<DoctorReports />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
