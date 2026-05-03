import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ADMIN_LINKS = [
  { to: '/dashboard', label: 'Portfolio', icon: '▦' },
  { to: '/alerts', label: 'Alerts', icon: '⚡' },
];

const STUDENT_LINKS = [
  { to: '/my-dashboard', label: 'My Risk Card', icon: '◎' },
];

export function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const links = isAdmin ? ADMIN_LINKS : STUDENT_LINKS;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-56 bg-[#16161D] border-r border-white/5 flex flex-col min-h-screen shrink-0">
      <div className="p-5 border-b border-white/5">
        <div className="text-base font-display font-semibold text-white">
          Repay<span className="text-purple-400">Signal</span>
        </div>
        <div className="text-xs text-white/30 mt-0.5 font-body">
          {isAdmin ? 'Lender portal' : 'Student portal'}
        </div>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1">
        {links.map(l => (
          <NavLink key={l.to} to={l.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all ${
                isActive
                  ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`
            }>
            <span className="text-base">{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-3">
        <div className="text-xs text-white/25 font-body">
          {user?.name}
        </div>
        <button onClick={handleLogout}
          className="w-full text-xs text-white/30 hover:text-red-400 text-left transition-colors font-body">
          Sign out →
        </button>
      </div>
    </aside>
  );
}