import { X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

const QRModal = ({ isOpen, onClose, customId }) => {
  if (!isOpen) return null;

  const qrUrl = `${window.location.origin}/emergency/${customId}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-space-900/80 backdrop-blur-sm" 
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-space-800 border border-teal-500/30 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(0,212,255,0.15)] flex flex-col items-center"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-space-700 rounded-full p-1"
          >
            <X size={20} />
          </button>
          
          <h3 className="text-xl font-bold text-white mb-2">Emergency QR Code</h3>
          <p className="text-sm text-slate-400 text-center mb-8">
            Responders can scan this to access your critical medical data securely.
          </p>

          <div className="bg-white p-4 rounded-2xl shadow-inner">
            <QRCodeSVG value={qrUrl} size={200} level="H" />
          </div>

          <div className="mt-8 px-4 py-2 bg-space-700 rounded-full border border-white/10">
            <span className="text-teal-400 font-mono text-sm tracking-wider">ID: {customId}</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QRModal;
