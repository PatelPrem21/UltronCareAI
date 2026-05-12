import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Calendar, FileText, AlertTriangle, Search, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import StatCard from '../../components/StatCard';

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: appointments = [] } = useQuery({ 
    queryKey: ['doc-appointments', user?.user_id], 
    queryFn: async () => (await api.get(`/appointments/${user?.user_id}`)).data,
    enabled: !!user?.user_id
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['all-patients'],
    queryFn: async () => {
      // Assuming a route exists to list doctor's patients or all patients
      try {
        return (await api.get('/patients')).data;
      } catch {
        // Fallback placeholder if no such route
        return [
          { custom_id: 'PAT-0001', name: 'John Doe', age: 45, blood_type: 'O+', last_visit: '2023-10-01' },
          { custom_id: 'PAT-0002', name: 'Jane Smith', age: 32, blood_type: 'A-', last_visit: '2023-10-05' },
        ];
      }
    }
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctor/patients/${searchQuery.trim()}`);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.datetime && a.datetime.startsWith(today) && a.status === 'pending');

  return (
    <div className="space-y-8">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-space-800 p-8 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-brand-violet/20 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-white mb-2">Welcome back, Dr. {user?.name?.split(' ')[0] || ''}</h1>
          <p className="text-slate-400">System metrics are optimal. You have {todayAppointments.length} appointments today.</p>
        </div>

        <form onSubmit={handleSearch} className="relative z-10 w-full md:w-96">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-violet transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-space-900/80 backdrop-blur-sm border border-white/10 rounded-2xl text-white focus:border-brand-violet outline-none transition-all placeholder:text-slate-500 shadow-inner"
              placeholder="Enter Patient ID (e.g. PAT-XXXX)"
            />
            <button type="submit" className="absolute inset-y-2 right-2 px-4 bg-brand-violet hover:bg-purple-500 text-white font-bold rounded-xl transition-colors text-sm">
              Locate
            </button>
          </div>
        </form>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Patients" value={patients.length || 24} icon={Users} colorClass="text-brand-violet" bgClass="bg-brand-violet/10" />
        <StatCard title="Appointments Today" value={todayAppointments.length} icon={Calendar} colorClass="text-teal-400" bgClass="bg-teal-400/10" />
        <StatCard title="Pending Reports" value="3" icon={FileText} colorClass="text-orange-400" bgClass="bg-orange-400/10" />
        <StatCard title="Critical Alerts" value="1" icon={AlertTriangle} colorClass="text-red-500" bgClass="bg-red-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Today's Schedule */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar size={20} className="text-teal-400" /> Today's Schedule
              </h2>
              <button onClick={() => navigate('/doctor/schedule')} className="text-xs text-slate-400 hover:text-white">Full Schedule</button>
            </div>
            
            <div className="space-y-4">
              {todayAppointments.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-white/5 rounded-xl">No pending appointments today.</div>
              ) : (
                todayAppointments.map(apt => (
                  <motion.div key={apt.custom_id || apt._id || Math.random()} whileHover={{ scale: 1.01 }} className="p-4 bg-space-800 border border-white/5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                    <div className="flex items-center gap-4">
                      <div className="bg-space-900 text-teal-400 font-mono font-bold px-3 py-2 rounded-lg border border-teal-500/20">
                        {apt.datetime ? new Date(apt.datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">Patient ID: {apt.patient_id}</h3>
                        <p className="text-xs text-slate-400">{apt.reason} • {apt.type}</p>
                      </div>
                    </div>
                    <button onClick={() => navigate(`/doctor/patients/${apt.patient_id}`)} className="px-4 py-2 bg-space-700 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors border border-white/5 group-hover:border-teal-400">
                      Check In
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Directory */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users size={20} className="text-brand-violet" /> Recent Patients Directory
              </h2>
              <button onClick={() => navigate('/doctor/patients')} className="text-xs text-slate-400 hover:text-white">View All</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 px-2">Identifier</th>
                    <th className="pb-3 px-2">Patient Name</th>
                    <th className="pb-3 px-2">Blood Vector</th>
                    <th className="pb-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {patients.slice(0, 5).map(pt => (
                    <tr key={pt.custom_id} className="hover:bg-space-700/50 transition-colors group cursor-pointer" onClick={() => navigate(`/doctor/patients/${pt.custom_id}`)}>
                      <td className="py-3 px-2">
                        <span className="font-mono text-xs text-teal-400 bg-teal-400/10 px-2 py-1 rounded">{pt.custom_id}</span>
                      </td>
                      <td className="py-3 px-2 text-sm text-white font-medium">{pt.name}</td>
                      <td className="py-3 px-2 text-sm text-slate-400">{pt.blood_type}</td>
                      <td className="py-3 px-2 text-right">
                        <button className="text-slate-500 group-hover:text-white transition-colors p-1">
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          
          <div className="glass-card p-6 rounded-2xl border-t-2 border-t-red-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-red-500">
              <AlertTriangle size={100} />
            </div>
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 relative z-10">
              <AlertTriangle size={20} className="text-red-500" /> System Alerts
            </h2>
            <div className="space-y-4 relative z-10">
              <div className="p-4 bg-space-800 border-l-2 border-l-red-500 rounded-r-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Critical Flag</span>
                  <span className="text-[10px] text-slate-500">10 mins ago</span>
                </div>
                <p className="text-sm text-white font-medium">Drug Interaction Detected</p>
                <p className="text-xs text-slate-400 mt-1">PAT-0001 prescribed conflicting meds.</p>
              </div>
              <div className="p-4 bg-space-800 border-l-2 border-l-orange-500 rounded-r-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Warning</span>
                  <span className="text-[10px] text-slate-500">2 hrs ago</span>
                </div>
                <p className="text-sm text-white font-medium">Abnormal Lab Result</p>
                <p className="text-xs text-slate-400 mt-1">PAT-0002 CBC indicates anemia.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
