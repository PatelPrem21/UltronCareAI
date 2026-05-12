import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Menu, X, Hexagon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import NotificationBell from './NotificationBell';
import { useState } from 'react';

const DoctorNavbar = () => {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Overview', path: '/doctor/dashboard' },
    { name: 'My Patients', path: '/doctor/patients' },
    { name: 'Schedule', path: '/doctor/schedule' },
    { name: 'Reports & Analytics', path: '/doctor/reports' }
  ];

  return (
    <nav className="fixed top-0 w-full h-16 glass-card z-50 px-4 md:px-8 flex items-center justify-between border-b border-white/5">
      <div className="flex items-center gap-2">
        <Link to="/doctor/dashboard" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center">
            <Hexagon size={32} className="text-brand-violet fill-brand-violet/20 group-hover:fill-brand-violet/40 transition-all" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white tracking-wider leading-none">
              ULTRON<span className="text-brand-violet">CARE</span>
            </span>
            <span className="text-[10px] text-brand-violet font-mono tracking-widest mt-0.5 font-bold uppercase">
              MD Terminal
            </span>
          </div>
        </Link>
      </div>

      {token && (
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className="text-sm font-medium text-slate-300 hover:text-brand-violet transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        {token && (
          <>
            <NotificationBell isDoctor />
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-white">
                  Dr. {user?.name || 'Doctor'}
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-space-600 border border-brand-violet/30 flex items-center justify-center text-brand-violet">
                <User size={18} />
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-space-600 rounded-lg transition-colors ml-2"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
            <button className="lg:hidden text-slate-300" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </>
        )}
      </div>

      {mobileOpen && token && (
        <div className="absolute top-16 left-0 w-full bg-space-800 border-b border-white/10 p-4 flex flex-col gap-4 lg:hidden">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-brand-violet transition-colors p-2 rounded hover:bg-space-700"
            >
              {link.name}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-400 p-2"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default DoctorNavbar;
