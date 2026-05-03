import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlerts, useMarkActioned } from '../hooks/useAlerts';
import { Topbar } from '../components/layout/Topbar';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';

const STATES = ['triggered', 'actioned'];

export function AlertsPage() {
  const [stateFilter, setStateFilter] = useState('triggered');
  const [actionTexts, setActionTexts] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { data: alertsList, isLoading } = useAlerts(stateFilter);
  const markActioned = useMarkActioned();

  return (
    <div className="flex-1 overflow-y-auto">
      <Topbar title="Alert case list" subtitle="All triggered interventions" />
      <div className="p-6 max-w-6xl">
        <div className="flex gap-2 mb-5">
          {STATES.map(s => (
            <button key={s} onClick={() => setStateFilter(s)}
              className={`text-sm px-4 py-1.5 rounded-full border transition-all font-body ${
                stateFilter === s
                  ? 'bg-purple-600/20 text-purple-300 border-purple-500/30'
                  : 'text-white/30 border-white/10 hover:border-white/20 hover:text-white/50'
              }`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? <LoadingSpinner /> : (
          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Student', 'Course', 'Trigger', 'Severity', 'Assignee', 'Deadline', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-white/25 font-body font-normal uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/3">
                {!alertsList?.length && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-white/20 text-sm font-body">
                      No alerts in this state
                    </td>
                  </tr>
                )}
                {alertsList?.map((alert: any) => (
                  <tr key={alert.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <button onClick={() => navigate(`/student/${alert.student_id}`)}
                        className="text-purple-400 hover:text-purple-300 font-body text-sm font-medium">
                        {alert.student_name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-white/30 font-body text-xs">{alert.student_course}</td>
                    <td className="px-4 py-3 text-white/50 font-body text-xs">{alert.trigger_name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-body ${
                        alert.severity === 'high'
                          ? 'text-red-400 bg-red-500/10 border-red-500/20'
                          : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                      }`}>{alert.severity}</span>
                    </td>
                    <td className="px-4 py-3 text-white/25 font-body text-xs">{alert.assignee}</td>
                    <td className="px-4 py-3 text-white/25 font-body text-xs">{alert.deadline || '—'}</td>
                    <td className="px-4 py-3">
                      {stateFilter === 'triggered' ? (
                        <div className="flex gap-2">
                          <input type="text" placeholder="Note..."
                            value={actionTexts[alert.id] || ''}
                            onChange={e => setActionTexts(p => ({ ...p, [alert.id]: e.target.value }))}
                            className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 w-28 text-white/60 outline-none focus:border-purple-500/40 font-body" />
                          <button
                            onClick={() => markActioned.mutate({ alertId: alert.id, action_taken: actionTexts[alert.id] || '' })}
                            className="text-xs bg-purple-600/80 hover:bg-purple-600 text-white px-3 py-1 rounded-lg transition-colors font-body">
                            Done
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-white/20 font-body">{alert.action_taken || '—'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}