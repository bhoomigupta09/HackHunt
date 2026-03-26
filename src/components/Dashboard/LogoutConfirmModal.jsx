import React from "react";

const LogoutConfirmModal = ({ open, onCancel, onConfirm }) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] border border-white/40 bg-white p-6 shadow-2xl">
        <h3 className="text-2xl font-bold tracking-tight text-slate-950">Confirm Logout</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Are you sure you want to log out of your account?
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
