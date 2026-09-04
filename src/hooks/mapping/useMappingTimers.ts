import { useState, useEffect, useRef, useCallback } from 'react';
import type { MappingTimerState } from '../../domain/mapping/types';
import { DEFAULT_MAPPING_TIMER_STATE } from '../../domain/mapping/constants';

export function useMappingTimers() {
  const [timerState, setTimerState] = useState<MappingTimerState>(DEFAULT_MAPPING_TIMER_STATE);
  const [sessionWallClockSeconds, setSessionWallClockSeconds] = useState<number>(0);

  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    sessionTimerRef.current = setInterval(() => {
      setSessionWallClockSeconds(prev => prev + 1);
    }, 1000);
    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (timerState.status === 'running') {
      timerIntervalRef.current = setInterval(() => {
        setTimerState(prev => ({ ...prev, elapsedSeconds: prev.elapsedSeconds + 1 }));
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerState.status]);

  const handlePauseMap = useCallback(() => {
    setTimerState(prev => ({ ...prev, status: 'paused' }));
  }, []);

  const handleResumeMap = useCallback(() => {
    setTimerState(prev => ({ ...prev, status: 'running' }));
  }, []);

  const handleResetTimer = useCallback(() => {
    setTimerState(prev => ({ ...prev, status: 'idle', elapsedSeconds: 0, startTimestamp: null }));
  }, []);

  return {
    timerState,
    setTimerState,
    sessionWallClockSeconds,
    handlePauseMap,
    handleResumeMap,
    handleResetTimer
  };
}
