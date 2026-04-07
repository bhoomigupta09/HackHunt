import React, { useState } from 'react';
import { X, Users, Loader2 } from 'lucide-react';

const RegistrationFormModal = ({
  open,
  hackathon,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState(1);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!teamName.trim()) {
      setError('Please enter your team name');
      return;
    }

    if (teamMembers < 1 || teamMembers > 10) {
      setError('Team members must be between 1 and 10');
      return;
    }

    onSubmit({
      teamName: teamName.trim(),
      teamMembers: parseInt(teamMembers)
    });

    setTeamName('');
    setTeamMembers(1);
  };

  const handleClose = () => {
    setTeamName('');
    setTeamMembers(1);
    setError('');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[32px] border border-white/70 bg-white/95 p-8 shadow-2xl dark:border-white/10 dark:bg-slate-900/95 dark:shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-950 dark:text-slate-50">
            Register for Hackathon
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X size={24} />
          </button>
        </div>

        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          {hackathon?.title || 'Hackathon Registration'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <Users size={16} />
              Team Members
            </label>
            <input
              type="number"
              value={teamMembers}
              onChange={(e) => setTeamMembers(e.target.value)}
              min="1"
              max="10"
              disabled={loading}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              1 to 10 members per team
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Team Name
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter your team name"
              disabled={loading}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:shadow-xl hover:shadow-violet-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Registering...
                </>
              ) : (
                'Complete Registration'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationFormModal;