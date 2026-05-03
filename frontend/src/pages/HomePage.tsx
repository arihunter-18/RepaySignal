import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { LoginPayload, RegisterPayload, UserRole } from '../types/auth';

type Mode = 'login' | 'register';

export function HomePage() {
  const { login, register, isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('login');
  const [role, setRole] = useState<UserRole>('admin');
  const [form, setForm] = useState({ name: '', email: '', password: '', student_id: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/dashboard' : '/my-dashboard');
    }
  }, [isAuthenticated, isLoading, user]);

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password, role });
      } else {
        const payload: RegisterPayload = {
          name: form.name, email: form.email,
          password: form.password, role,
          ...(role === 'student' ? { student_id: form.student_id } : {}),
        };
        await register(payload);
      }
      navigate(role === 'admin' ? '/dashboard' : '/my-dashboard');
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div className="min-h-screen bg-[#0F0F13] flex flex-col relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-teal-500/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="font-display text-xl font-bold text-white">
          Repay<span className="text-purple-400">Signal</span>
        </div>
        <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-body">
          ✦ SYSTEM V2.4 ONLINE
        </span>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center text-center pt-16 pb-10 px-4 animate-fade-up">
        <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-none mb-4">
          Smarter Lending<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-400">
            through Career Intelligence
          </span>
        </h1>
        <p className="text-white/40 text-lg font-body max-w-xl mt-4">
          Predicting placement timelines, salary ranges, and repayment risk for education loan portfolios.
        </p>
      </div>

      {/* Feature pills */}
      <div className="relative z-10 flex justify-center gap-4 flex-wrap px-4 mb-12">
        {[
          { icon: '◈', label: 'Predictive Analytics', desc: 'Real-time risk scoring' },
          { icon: '◉', label: 'Behavioral Modeling', desc: 'Live engagement tracking' },
          { icon: '◇', label: 'Portfolio Protection', desc: 'Heatmap visualization' },
        ].map(f => (
          <div key={f.label}
            className="bg-white/3 border border-white/8 rounded-2xl p-4 w-52 text-left hover:border-white/15 transition-colors">
            <div className="text-2xl text-purple-400 mb-3">{f.icon}</div>
            <div className="text-sm font-semibold text-white font-display mb-1">{f.label}</div>
            <div className="text-xs text-white/30 font-body">{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Auth panel */}
      <div className="relative z-10 flex justify-center px-4 pb-16">
        <div className="w-full max-w-md bg-white/3 border border-white/8 rounded-3xl p-8 backdrop-blur-sm">

          {/* Role toggle */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            {(['admin', 'student'] as UserRole[]).map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={`flex-1 py-2 text-sm rounded-lg transition-all font-body ${
                  role === r
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-white/30 hover:text-white/50'
                }`}>
                {r === 'admin' ? '🏦 Lender / Admin' : '🎓 Student'}
              </button>
            ))}
          </div>

          {/* Mode toggle */}
          <div className="flex gap-4 mb-6">
            {(['login', 'register'] as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                className={`text-sm pb-1 border-b transition-all font-body ${
                  mode === m
                    ? 'text-purple-400 border-purple-400'
                    : 'text-white/25 border-transparent hover:text-white/40'
                }`}>
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {/* Form fields */}
          <div className="space-y-3">
            {mode === 'register' && (
              <input value={form.name} onChange={set('name')} placeholder="Full name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/50 transition-colors font-body" />
            )}
            <input value={form.email} onChange={set('email')} placeholder="Email address" type="email"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/50 transition-colors font-body" />
            <input value={form.password} onChange={set('password')} placeholder="Password" type="password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/50 transition-colors font-body" />
            {mode === 'register' && role === 'student' && (
              <input value={form.student_id} onChange={set('student_id')} placeholder="Loan account / student ID"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/50 transition-colors font-body" />
            )}
          </div>

          {error && (
            <p className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 font-body">
              {error}
            </p>
          )}

          <button onClick={handleSubmit} disabled={submitting}
            className="w-full mt-5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white py-3 rounded-xl text-sm font-medium transition-all font-body">
            {submitting ? 'Please wait...' : mode === 'login' ? `Sign in as ${role}` : 'Create account'}
          </button>

          <p className="text-xs text-white/15 text-center mt-4 font-body">
            Demo: admin@test.com / student@test.com · password: demo123
          </p>
        </div>
      </div>
    </div>
  );
}