import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, colorClass = "text-teal-400", bgClass = "bg-teal-400/10" }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-all"
    >
      <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={120} />
      </div>
      
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className={`w-12 h-12 rounded-full ${bgClass} flex items-center justify-center ${colorClass}`}>
          <Icon size={24} />
        </div>
        <h3 className="text-slate-400 font-medium text-sm tracking-wide">{title}</h3>
      </div>
      
      <div className="relative z-10">
        <span className="text-4xl font-bold text-white tracking-tight">{value}</span>
      </div>
    </motion.div>
  );
};

export default StatCard;
