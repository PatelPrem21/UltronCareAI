import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  Activity, 
  TestTube2, 
  Calendar, 
  Users, 
  PlusCircle, 
  AlertTriangle,
  Pill
} from 'lucide-react';

const Sidebar = () => {
  const { role } = useAuthStore();

  const patientLinks = [
    { to: '/patient/dashboard', icon: LayoutDashboard, label: 'Home' },
    { to: '/patient/timeline', icon: Activity, label: 'Timeline' },
    { to: '/patient/labs', icon: TestTube2, label: 'Lab Reports' },
    { to: '/patient/appointments', icon: Calendar, label: 'Appointments' },
  ];

  const doctorLinks = [
    { to: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/doctor/patients', icon: Users, label: 'Patients' },
    { to: '/doctor/visit/new', icon: PlusCircle, label: 'Add Visit' },
    { to: '/doctor/alerts', icon: AlertTriangle, label: 'AI Alerts' },
  ];

  const links = role === 'doctor' ? doctorLinks : patientLinks;

  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-bg-secondary border-r border-border p-4 hidden md:block">
      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                }`
              }
            >
              <Icon size={18} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
