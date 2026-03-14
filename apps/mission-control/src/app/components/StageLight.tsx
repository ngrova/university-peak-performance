export type StageStatus = 'idle' | 'running' | 'done' | 'failed';

const COLOR: Record<StageStatus, string> = {
  idle: '#444444',
  running: '#FACC15',
  done: '#4ADE80',
  failed: '#F87171',
};

interface Props {
  status: StageStatus;
  label: string;
}

export function StageLight({ status, label }: Props) {
  const color = COLOR[status];
  return (
    <div className="flex items-center gap-3">
      <svg width="14" height="14" aria-hidden="true">
        <circle cx="7" cy="7" r="7" fill={color} />
      </svg>
      <span
        className="font-mono text-sm uppercase tracking-wider"
        style={{ color: status === 'idle' ? '#666' : '#E5E5E5' }}
      >
        {label}
      </span>
    </div>
  );
}
