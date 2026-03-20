'use client';

import React from 'react';

interface DeleteConfirmProps {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Inline confirmation row shown before deleting a task */
export default function DeleteConfirm({ title, onConfirm, onCancel }: DeleteConfirmProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between py-3 px-1" style={{ minHeight: '44px' }}>
      <p className="text-sm truncate mr-2" style={{ color: 'var(--danger)' }}>
        Delete &ldquo;{title}&rdquo;?
      </p>
      <div className="flex gap-2 flex-shrink-0">
        <button type="button" onClick={onCancel} className="px-3 py-1 text-xs rounded-lg" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm} className="px-3 py-1 text-xs rounded-lg" style={{ backgroundColor: 'var(--danger)', color: '#fff' }}>
          Delete
        </button>
      </div>
    </div>
  );
}
