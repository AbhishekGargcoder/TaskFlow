import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-white z-20 rounded-2xl flex flex-col justify-center items-center p-4 text-center animate-in fade-in duration-200">
      <div className="w-full max-w-xs">
        <div className="w-10 h-10 rounded-full bg-red-50 text-rose-600 flex items-center justify-center mx-auto mb-3 animate-pulse">
          <svg className="w-5 h-5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">
          {title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-4 px-2">
          {message}
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold text-xs transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-rose-500/15 hover:shadow-rose-500/25 transition duration-200 cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}





/*

<ConfirmDeleteDialog isOpen = {isDelete} />

*/
