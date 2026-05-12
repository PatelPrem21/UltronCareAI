import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Activity, Shield, Brain, ArrowRight, Dna, Heart, Zap, Eye } from 'lucide-react';
import Navbar from '../components/Navbar';

/* ── Animated Counter ── */
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = parseFloat(target);
    const step = end / (2000 / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(parseFloat(start.toFixed(1)));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Particle Canvas ── */
function ParticleBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.4 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,200,${p.opacity})`;
        ctx.fill();
      });
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0,212,200,${0.07 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

/* ── ECG Line ── */
function ECGLine() {
  return (
    <div className="w-full overflow-hidden h-14 relative">
      <svg viewBox="0 0 1200 60" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00d4c8" stopOpacity="0" />
            <stop offset="50%" stopColor="#00d4c8" stopOpacity="1" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.polyline
          points="0,30 80,30 100,30 120,5 140,55 160,20 180,30 280,30 300,30 320,5 340,55 360,20 380,30 480,30 500,30 520,5 540,55 560,20 580,30 680,30 700,30 720,5 740,55 760,20 780,30 880,30 900,30 920,5 940,55 960,20 980,30 1100,30 1200,30"
          fill="none" stroke="url(#ecgGrad)" strokeWidth="2" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.5 }}
        />
      </svg>
    </div>
  );
}

/* ── Floating Icon ── */
function FloatingIcon({ icon: Icon, color, delay = 0, style }) {
  return (
    <motion.div
      className="absolute flex items-center justify-center rounded-full"
      style={{ width: 48, height: 48, background: `${color}15`, border: `1px solid ${color}30`, ...style }}
      animate={{ y: [-8, 8, -8], rotate: [0, 5, -5, 0] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <Icon size={20} color={color} strokeWidth={1.5} />
    </motion.div>
  );
}

/* ── Scan Ring ── */
function ScanRing({ size, duration, color, delay = 0 }) {
  return (
    <motion.div
      className="absolute rounded-full border"
      style={{ width: size, height: size, borderColor: `${color}25`, left: '50%', top: '50%', marginLeft: -size / 2, marginTop: -size / 2 }}
      animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0.1, 0.6] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

const STATS = [
  { num: 98.4, suffix: '%', label: 'Diagnostic Accuracy' },
  { num: 2.3, suffix: 's', label: 'Avg AI Response' },
  { num: 12, suffix: 'K+', label: 'Patients Served' },
  { num: 340, suffix: '+', label: 'Doctors Onboard' },
];

const FEATURES = [
  { title: 'Predictive Vitals', desc: 'ML models detect deterioration before it becomes critical — green, orange, red severity in real time.', icon: Activity, color: '#00d4c8' },
  { title: 'Smart Prescriptions', desc: 'Automated conflict detection against global allergy and drug interaction databases instantly.', icon: Shield, color: '#7c3aed' },
  { title: 'AI Copilot', desc: 'Clinical assistant that parses lab reports, imaging, and genomics — suggests actionable next steps.', icon: Brain, color: '#00d4c8' },
  { title: 'Genomic Profiling', desc: 'Decode DNA to predict disease risk, drug response, and personalised treatment paths.', icon: Dna, color: '#7c3aed' },
  { title: 'Real-time Monitoring', desc: 'Continuous vitals tracking with instant AI-generated alerts sent to care teams 24/7.', icon: Heart, color: '#ff4466' },
  { title: 'Computer Vision', desc: 'Radiologist-level X-ray, MRI and CT scan analysis completed in under 3 seconds.', icon: Eye, color: '#00d4c8' },
];

export default function Landing() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -60]);

  const containerV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } };
  const itemV = { hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 80 } } };

  return (
    <div className="min-h-screen bg-space-900 overflow-x-hidden relative">
      <Navbar />
      <ParticleBackground />

      {/* Ambient glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[55%] h-[55%] bg-teal-500/8 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[55%] h-[55%] bg-brand-violet/8 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* ── HERO ── */}
      <motion.section
        style={{ y: heroY }}
        className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 px-4 md:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 z-10"
      >
        <motion.div className="flex-1 text-center lg:text-left" variants={containerV} initial="hidden" animate="visible">
          <motion.div variants={itemV} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            AI-Powered Medical Platform
          </motion.div>

          <motion.h1 variants={itemV} className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight tracking-tighter">
            Healthcare,<br />
            <span className="text-gradient">Reimagined.</span>
          </motion.h1>

          <motion.p variants={itemV} className="text-lg md:text-xl text-slate-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            UltronCare unites predictive AI, patient telemetry, and deep medical insights into one unified terminal. Advanced care, zero friction.
          </motion.p>

          <motion.div variants={itemV} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-teal-500 to-brand-violet text-white font-bold text-lg hover:shadow-[0_0_40px_rgba(0,212,200,0.35)] transition-all flex items-center justify-center gap-2 group">
              Start Your Journey <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/20 text-white font-bold text-lg hover:bg-white/5 hover:border-teal-500/40 transition-all text-center">
              Existing User
            </Link>
          </motion.div>

          <motion.div variants={itemV} className="mt-12 max-w-md mx-auto lg:mx-0">
            <ECGLine />
            <p className="text-xs text-slate-600 text-center lg:text-left mt-1 tracking-widest uppercase">Live AI Monitoring Active</p>
          </motion.div>
        </motion.div>

        {/* ── Right Visual ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex-1 hidden lg:flex justify-center relative"
        >
          <div className="relative w-[420px] h-[420px]">
            <ScanRing size={420} duration={4} color="#00d4c8" delay={0} />
            <ScanRing size={320} duration={3.5} color="#7c3aed" delay={0.5} />
            <ScanRing size={220} duration={3} color="#00d4c8" delay={1} />

            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div className="w-36 h-36 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,212,200,0.18) 0%, transparent 70%)' }}
                animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-teal-400/60">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
                <Dna size={160} strokeWidth={0.8} />
              </motion.div>
            </div>

            <FloatingIcon icon={Heart} color="#ff4466" delay={0} style={{ left: '-8%', top: '15%' }} />
            <FloatingIcon icon={Brain} color="#7c3aed" delay={1} style={{ right: '-8%', top: '10%' }} />
            <FloatingIcon icon={Activity} color="#00d4c8" delay={0.5} style={{ left: '-12%', bottom: '20%' }} />
            <FloatingIcon icon={Zap} color="#00d4c8" delay={1.5} style={{ right: '-8%', bottom: '20%' }} />

            <motion.div animate={{ y: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute -left-16 top-16 glass-card p-4 rounded-2xl flex items-center gap-3 z-10"
              style={{ boxShadow: '0 0 24px rgba(124,58,237,0.2)' }}>
              <div className="w-10 h-10 rounded-full bg-brand-violet/20 text-brand-violet flex items-center justify-center flex-shrink-0"><Brain size={20} /></div>
              <div><p className="text-white font-bold text-sm">AI Diagnosis</p><p className="text-teal-400 text-xs font-mono">99.8% Accuracy</p></div>
            </motion.div>

            <motion.div animate={{ y: [10, -10, 10] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              className="absolute -right-16 bottom-16 glass-card p-4 rounded-2xl flex items-center gap-3 z-10"
              style={{ boxShadow: '0 0 24px rgba(0,212,200,0.2)' }}>
              <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0"><Activity size={20} /></div>
              <div><p className="text-white font-bold text-sm">Vitals Secure</p><p className="text-teal-400 text-xs font-mono">Real-time sync</p></div>
            </motion.div>

            <motion.div animate={{ y: [-6, 6, -6] }} transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.8 }}
              className="absolute left-1/2 -translate-x-1/2 -bottom-10 glass-card p-3 rounded-xl flex items-center gap-3 z-10"
              style={{ boxShadow: '0 0 20px rgba(255,68,102,0.2)' }}>
              <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0"><Heart size={16} /></div>
              <div><p className="text-white font-bold text-xs">Heart Rate</p><p className="text-red-400 text-xs font-mono">72 BPM ● Normal</p></div>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      {/* ── STATS ── */}
      <section className="relative z-10 py-16 border-y border-white/5 bg-space-800/60 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-brand-violet font-mono">
                <Counter target={s.num} suffix={s.suffix} />
              </div>
              <div className="text-slate-400 text-sm mt-2">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative z-10 py-28 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal-500/20 bg-teal-500/5 text-teal-400 text-xs font-semibold tracking-widest uppercase mb-5">
            Platform Capabilities
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">Intelligent Core Modules</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">Enterprise-grade architecture paired with empathetic AI design.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className="glass-card p-7 rounded-3xl group cursor-default border border-white/5 transition-shadow"
                style={{ '--hover-glow': `${f.color}15` }}
              >
                <motion.div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}
                  whileHover={{ scale: 1.1, rotate: 5 }}>
                  <Icon size={26} color={f.color} strokeWidth={1.5} />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{f.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold" style={{ color: f.color }}>
                  Learn more <ArrowRight size={12} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 py-24 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-500/3 to-transparent pointer-events-none" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
          <div className="mb-6"><ECGLine /></div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Ready to experience the <span className="text-gradient">future</span>?
          </h2>
          <p className="text-slate-400 text-lg mb-10">Join 12,000+ patients and 340+ doctors already on UltronCare.AI</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="px-10 py-4 rounded-full bg-gradient-to-r from-teal-500 to-brand-violet text-white font-bold text-lg hover:shadow-[0_0_40px_rgba(0,212,200,0.3)] transition-all flex items-center justify-center gap-2 group">
              Join as Patient <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/register" className="px-10 py-4 rounded-full border border-white/20 text-white font-bold text-lg hover:bg-white/5 transition-all">
              Join as Doctor
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 py-8 border-t border-white/5 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-white font-bold">ULTRON<span className="text-teal-400">CARE</span>.AI</span>
        </div>
        <p>© 2026 UltronCare.AI · Building the future of medicine · Made with ❤️ in India</p>
      </footer>
    </div>
  );
}