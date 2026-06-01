import React, { useState, useEffect } from 'react';
import { X, Check, XCircle, Users, Activity, Download, Copy, RefreshCw } from 'lucide-react';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'requests' | 'report'>('requests');
  const [requests, setRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    const { data } = await supabase
      .from('access_requests')
      .select('*')
      .order('created_at', { ascending: false });
    setRequests(data || []);
  };

  const loadReport = async () => {
    const [profilesRes, activityRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(100),
    ]);
    setUsers(profilesRes.data || []);
    setActivity(activityRes.data || []);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadRequests(), loadReport()]);
      setLoading(false);
    };
    load();
  }, []);

  const handleApprove = async (id: string, email: string) => {
    const { error } = await supabase
      .from('access_requests')
      .update({ status: 'approved' })
      .eq('id', id);
    if (error) { toast.error('Failed to approve'); return; }
    toast.success(`Approved! Now create an account for ${email} in Supabase Auth.`);
    loadRequests();
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from('access_requests')
      .update({ status: 'rejected' })
      .eq('id', id);
    if (error) { toast.error('Failed to reject'); return; }
    toast.success('Request rejected');
    loadRequests();
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

  // Group activity by user for report
  const userActivity = users.map(u => {
    const userActions = activity.filter(a => a.user_email === u.email);
    const lastLogin = userActions.filter(a => a.action === 'login').sort((x, y) =>
      new Date(y.created_at).getTime() - new Date(x.created_at).getTime()
    )[0];
    const copies = userActions.filter(a => a.action === 'copy_prompt').length;
    const downloads = userActions.filter(a => a.action === 'download_skill').length;
    const logins = userActions.filter(a => a.action === 'login').length;
    return { ...u, lastLogin: lastLogin?.created_at, copies, downloads, logins };
  });

  const actionLabel: Record<string, string> = {
    login: '🔐 Logged in',
    copy_prompt: '📋 Copied prompt',
    download_skill: '⬇️ Downloaded skill',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-900">Admin Panel</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 shrink-0">
          <button
            onClick={() => setTab('requests')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition border-b-2 ${
              tab === 'requests' ? 'text-violet-700 border-violet-600' : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            <Users size={15} />
            Access Requests
            {pendingRequests.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('report')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition border-b-2 ${
              tab === 'report' ? 'text-violet-700 border-violet-600' : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            <Activity size={15} />
            Usage Report
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <RefreshCw size={20} className="animate-spin text-slate-400" />
            </div>
          ) : tab === 'requests' ? (
            <div className="space-y-4">
              {requests.length === 0 ? (
                <p className="text-center text-slate-400 py-8">No access requests yet.</p>
              ) : (
                requests.map(req => (
                  <div key={req.id} className={`border rounded-xl p-4 ${
                    req.status === 'pending' ? 'border-amber-200 bg-amber-50' :
                    req.status === 'approved' ? 'border-emerald-200 bg-emerald-50' :
                    'border-slate-200 bg-slate-50'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-slate-900">{req.name}</span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            req.status === 'pending' ? 'bg-amber-200 text-amber-800' :
                            req.status === 'approved' ? 'bg-emerald-200 text-emerald-800' :
                            'bg-slate-200 text-slate-600'
                          }`}>
                            {req.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{req.email}</p>
                        {req.reason && (
                          <p className="text-sm text-slate-500 mt-1 italic">"{req.reason}"</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {req.status === 'pending' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleApprove(req.id, req.email)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
                          >
                            <Check size={13} /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                    {req.status === 'approved' && (
                      <p className="text-xs text-emerald-700 mt-2 font-medium">
                        ✓ Approved — create their account in Supabase Auth → Authentication → Users → Invite User
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* User summary table */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Users size={14} /> Users ({users.length})
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                        <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          <span className="flex items-center gap-1 justify-center"><Activity size={11} /> Logins</span>
                        </th>
                        <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          <span className="flex items-center gap-1 justify-center"><Copy size={11} /> Copies</span>
                        </th>
                        <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          <span className="flex items-center gap-1 justify-center"><Download size={11} /> Downloads</span>
                        </th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Login</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {userActivity.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-6 text-slate-400">No users yet</td></tr>
                      ) : (
                        userActivity.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50 transition">
                            <td className="px-4 py-3 text-slate-900 font-medium truncate max-w-[180px]">{u.email}</td>
                            <td className="px-4 py-3">
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                u.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-slate-600">{u.logins}</td>
                            <td className="px-4 py-3 text-center text-slate-600">{u.copies}</td>
                            <td className="px-4 py-3 text-center text-slate-600">{u.downloads}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs">
                              {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent activity */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Activity size={14} /> Recent Activity
                </h3>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {activity.length === 0 ? (
                    <p className="text-slate-400 text-sm">No activity logged yet.</p>
                  ) : (
                    activity.map(a => (
                      <div key={a.id} className="flex items-center justify-between text-sm py-2 px-3 rounded-lg hover:bg-slate-50 transition">
                        <div className="flex items-center gap-2 min-w-0">
                          <span>{actionLabel[a.action] || a.action}</span>
                          {a.resource_name && (
                            <span className="text-slate-400 truncate">— {a.resource_name}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-slate-400 text-xs truncate max-w-[140px]">{a.user_email}</span>
                          <span className="text-slate-300 text-xs">
                            {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
