import type { StageStatus } from './StageLight';

export type StageName = 'memory' | 'clear' | 'restart' | 'verify';

export interface RewindState {
  running: boolean;
  stages: Record<StageName, StageStatus>;
  error: string | null;
  memoryPrompt: boolean;
}

export const INITIAL_STATE: RewindState = {
  running: false,
  stages: { memory: 'idle', clear: 'idle', restart: 'idle', verify: 'idle' },
  error: null,
  memoryPrompt: false,
};

export type RewindAction =
  | { type: 'START' }
  | { type: 'STAGE_RUNNING'; stage: StageName }
  | { type: 'STAGE_DONE'; stage: StageName }
  | { type: 'STAGE_FAILED'; stage: StageName; error: string }
  | { type: 'SHOW_MEMORY_PROMPT' }
  | { type: 'RESET' };

export function rewindReducer(state: RewindState, action: RewindAction): RewindState {
  switch (action.type) {
    case 'START':
      return { ...INITIAL_STATE, running: true, memoryPrompt: true };
    case 'SHOW_MEMORY_PROMPT':
      return { ...state, memoryPrompt: true };
    case 'STAGE_RUNNING':
      return { ...state, memoryPrompt: false, stages: { ...state.stages, [action.stage]: 'running' } };
    case 'STAGE_DONE':
      return { ...state, stages: { ...state.stages, [action.stage]: 'done' } };
    case 'STAGE_FAILED':
      return { ...state, running: false, error: action.error, stages: { ...state.stages, [action.stage]: 'failed' } };
    case 'RESET':
      return INITIAL_STATE;
    default:
      return state;
  }
}
