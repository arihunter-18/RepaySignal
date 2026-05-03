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
    <div className="flex-1 overflow-y-auto bg-slate-50"> {/* Added slate-50 page background */}
      <Topbar title="Alert case list" subtitle="All triggered interventions" />
      
      <div className="p-6 max-w-6xl">
        {/* State Filter Buttons */}
        <div className="flex gap-2 mb-6">
          {STATES.map(s => (
            <button key={s} onClick={() => setStateFilter(s)}
              className={`text-xs px-5 py-2 rounded-full border transition-all font-body font-semibold shadow-sm ${
                stateFilter === s
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? <LoadingSpinner label="Retrieving alerts..." /> : (
          /* Table Container: Solid white with subtle shadow */
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                /* Table Header: Swapped text-white/25 for text-slate-400 */
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  {['Student', 'Course', 'Trigger', 'Severity', 'Assignee', 'Deadline', 'Action'].map(h => (
                    <th key={h} className="px-4 py-4 text-left text-[10px] text-slate-400 font-bold font-body uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!alertsList?.length && (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-slate-400 text-sm font-body">
                      No active alerts found for this state.
                    </td>
                  </tr>
                )}
                {alertsList?.map((alert: any) => (
                  <tr key={alert.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-4">
                      <button onClick={() => navigate(`/student/${alert.student_id}`)}
                        className="text-purple-600 hover:text-purple-800 font-body text-sm font-bold">
                        {alert.student_name}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-slate-500 font-body text-xs">{alert.student_course}</td>
                    <td className="px-4 py-4 text-slate-700 font-body text-xs font-medium">{alert.trigger_name}</td>
                    <td className="px-4 py-4">
                      /* Severity Badges: Using soft backgrounds and dark text */
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide font-body ${
                        alert.severity === 'high'
                          ? 'text-red-700 bg-red-50 border-red-100'
                          : 'text-amber-700 bg-amber-50 border-amber-100'
                      }`}>{alert.severity}</span>
                    </td>
                    <td className="px-4 py-4 text-slate-500 font-body text-xs">{alert.assignee}</td>
                    <td className="px-4 py-4 text-slate-500 font-body text-xs">{alert.deadline || '—'}</td>
                    <td className="px-4 py-4">
                      {stateFilter === 'triggered' ? (
                        <div className="flex gap-2">
                          <input type="text" placeholder="Add note..."
                            value={actionTexts[alert.id] || ''}
                            onChange={e => setActionTexts(p => ({ ...p, [alert.id]: e.target.value }))}
                            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-32 text-slate-900 placeholder-slate-400 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all font-body" />
                          <button
                            onClick={() => markActioned.mutate({ alertId: alert.id, action_taken: actionTexts[alert.id] || '' })}
                            className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg transition-all font-bold shadow-sm shadow-purple-200">
                            Done
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic font-body">{alert.action_taken || '—'}</span>
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