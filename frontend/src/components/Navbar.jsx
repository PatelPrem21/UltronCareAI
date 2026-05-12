import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Menu, X, Hexagon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import NotificationBell from './NotificationBell';
import { useState } from 'react';

const Navbar = () => {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/patient/dashboard' },
    { name: 'Appointments', path: '/patient/appointments' },
    { name: 'Documents', path: '/patient/labs' },
    { name: 'Prescriptions', path: '/patient/prescriptions' },
    { name: 'Ultron AI', path: '/patient/chat' }
  ];

  return (
    <nav className="fixed top-0 w-full h-16 glass-card z-50 px-4 md:px-8 flex items-center justify-between border-b border-white/5">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center">
            <Hexagon size={32} className="text-teal-400 fill-teal-400/20 group-hover:fill-teal-400/40 transition-all" />
            <div className="absolute w-2 h-2 bg-brand-violet rounded-full shadow-[0_0_10px_#7C3AED]"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white tracking-wider leading-none">
              ULTRON<span className="text-teal-400">CARE</span>
            </span>
            {user?.custom_id && (
              <span className="text-[10px] text-teal-500 font-mono tracking-widest mt-0.5">
                ID: {user.custom_id}
              </span>
            )}
          </div>
        </Link>
      </div>

      {token && (
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className="text-sm font-medium text-slate-300 hover:text-teal-400 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        {token ? (
          <>
            <NotificationBell />
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-white">
                  {user?.name || 'Patient'}
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-space-600 border border-teal-500/30 flex items-center justify-center text-teal-400">
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
        ) : (
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-300 hover:text-teal-400 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 text-sm font-medium bg-gradient-to-r from-teal-500 to-teal-400 text-space-900 rounded-full hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all"
            >
              Start Journey
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileOpen && token && (
        <div className="absolute top-16 left-0 w-full bg-space-800 border-b border-white/10 p-4 flex flex-col gap-4 lg:hidden">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-teal-400 transition-colors p-2 rounded hover:bg-space-700"
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

export default Navbar;
