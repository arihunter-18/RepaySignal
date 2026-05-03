import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/auth';

type Mode = 'login' | 'register';

export function HomePage() {
  const { login, isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('login');
  const [role, setRole] = useState<UserRole>('admin');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/dashboard' : '/my-dashboard');
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await login({
        name: form.name || 'User',
        email: form.email || 'user@example.com',
        password: form.password || 'demo123',
        role,
      });
      navigate(role === 'admin' ? '/dashboard' : '/my-dashboard');
    } catch {
      navigate(role === 'admin' ? '/dashboard' : '/my-dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    /* Background changed to slate-50 */
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Background glow blobs - Adjusted opacity for light mode */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="font-display text-xl font-bold text-slate-900">
          Repay<span className="text-purple-600">Signal</span>
        </div>
        {/* Status Badge: Swapped for light-theme colors */}
        <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-body font-semibold">
          ✦ SYSTEM V2.4 ONLINE
        </span>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center text-center pt-16 pb-10 px-4 animate-fade-up">
        {/* Swapped text-white for text-slate-900 */}
        <h1 className="font-display text-5xl md:text-7xl font-bold text-slate-900 leading-none mb-4">
          Smarter Lending<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-teal-600">
            through Career Intelligence
          </span>
        </h1>
        <p className="text-slate-500 text-lg font-body max-w-xl mt-4">
          Predicting placement timelines, salary ranges, and repayment risk for education loan portfolios.
        </p>
      </div>

      {/* Feature pills: Swapped bg-white/3 for solid white with shadow */}
      <div className="relative z-10 flex justify-center gap-4 flex-wrap px-4 mb-12">
        {[
          { icon: '◈', label: 'Predictive Analytics', desc: 'Real-time risk scoring' },
          { icon: '◉', label: 'Behavioral Modeling', desc: 'Live engagement tracking' },
          { icon: '◇', label: 'Portfolio Protection', desc: 'Heatmap visualization' },
        ].map(f => (
          <div key={f.label}
            className="bg-white border border-slate-200 rounded-2xl p-4 w-52 text-left hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/5 transition-all">
            <div className="text-2xl text-purple-600 mb-3">{f.icon}</div>
            <div className="text-sm font-bold text-slate-800 font-display mb-1">{f.label}</div>
            <div className="text-xs text-slate-400 font-body">{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Auth panel */}
      <div className="relative z-10 flex justify-center px-4 pb-16">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50 backdrop-blur-sm">

          {/* Role toggle: Segmented control style */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            {(['admin', 'student'] as UserRole[]).map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={`flex-1 py-2 text-sm rounded-lg transition-all font-body ${
                  role === r
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}>
                {r === 'admin' ? '🏦 Lender / Admin' : '🎓 Student'}
              </button>
            ))}
          </div>

          {/* Mode toggle */}
          <div className="flex gap-4 mb-6">
            {(['login', 'register'] as Mode[]).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`text-sm pb-1 border-b-2 transition-all font-body font-semibold ${
                  mode === m
                    ? 'text-purple-600 border-purple-600'
                    : 'text-slate-300 border-transparent hover:text-slate-500'
                }`}>
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {/* Form fields: Light gray inputs with slate text */}
          <div className="space-y-3">
            {mode === 'register' && (
              <input value={form.name} onChange={set('name')} onKeyPress={handleKeyPress}
                placeholder="Full name"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all font-body" />
            )}
            <input value={form.email} onChange={set('email')} onKeyPress={handleKeyPress}
              placeholder="Email address (optional)" type="email"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all font-body" />
            <input value={form.password} onChange={set('password')} onKeyPress={handleKeyPress}
              placeholder="Password (optional)" type="password"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all font-body" />
          </div>

          <button onClick={handleSubmit} disabled={submitting}
            className="w-full mt-5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-200 font-body">
            {submitting ? 'Please wait...' : mode === 'login' ? `Sign in as ${role}` : 'Create account'}
          </button>

          <p className="text-xs text-slate-400 text-center mt-4 font-body">
            Any username/password works — select your role above
          </p>
        </div>
      </div>
    </div>
  );
}