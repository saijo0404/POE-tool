import { useState, useEffect, useCallback } from 'react';

interface UseAtlasPlannerHistoryProps {
  strategyId: string;
  tierId: string;
  initialAllocatedNodes?: string[];
  onShowToast: (msg: string) => void;
}

export function useAtlasPlannerHistory({
  strategyId,
  tierId,
  initialAllocatedNodes,
  onShowToast
}: UseAtlasPlannerHistoryProps) {
  const [allocatedNodeIds, setAllocatedNodeIds] = useState<Set<string>>(() => {
    return new Set(initialAllocatedNodes && initialAllocatedNodes.length > 0 ? initialAllocatedNodes : ['29045']);
  });

  const [history, setHistory] = useState<string[][]>(() => [
    initialAllocatedNodes && initialAllocatedNodes.length > 0 ? initialAllocatedNodes : ['29045']
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  useEffect(() => {
    const list = initialAllocatedNodes && initialAllocatedNodes.length > 0 ? initialAllocatedNodes : ['29045'];
    setAllocatedNodeIds(new Set(list));
    setHistory([list]);
    setHistoryIndex(0);
  }, [strategyId, tierId, initialAllocatedNodes]);

  const commitAllocatedChange = useCallback((nextSet: Set<string>) => {
    const arr = Array.from(nextSet);
    setHistory(prev => [...prev.slice(0, historyIndex + 1), arr]);
    setHistoryIndex(prev => prev + 1);
    setAllocatedNodeIds(nextSet);
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setAllocatedNodeIds(new Set(history[prevIndex]));
      onShowToast('↩️ 已復原上一步配置');
    }
  }, [history, historyIndex, onShowToast]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setAllocatedNodeIds(new Set(history[nextIndex]));
      onShowToast('↪️ 已重做下一步配置');
    }
  }, [history, historyIndex, onShowToast]);

  return {
    allocatedNodeIds,
    setAllocatedNodeIds,
    historyIndex,
    historyLength: history.length,
    commitAllocatedChange,
    handleUndo,
    handleRedo
  };
}
