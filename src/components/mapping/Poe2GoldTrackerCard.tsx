import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Coins, Skull, Trophy, Flame, ScrollText, Radio, CheckCircle2 } from 'lucide-react';
import type { MappingSessionStats, MapRun } from '../../domain/mapping/types';
import { formatGold, formatGoldPerHour } from '../../domain/mapping/poe2MappingCalculator';
import { Poe2RunTracker } from '../../domain/mapping/poe2RunTracker';
import { parsePoe2LogLine } from '../../domain/mapping/poe2LogParser';
import { isTauri } from '../../utils/tauri';

interface Poe2GoldTrackerCardProps {
  stats: MappingSessionStats;
  runs: MapRun[];
  onImportRuns: (runs: MapRun[]) => void;
  onShowToast: (msg: string) => void;
}

export const Poe2GoldTrackerCard: React.FC<Poe2GoldTrackerCardProps> = ({
  stats,
  runs,
  onImportRuns,
  onShowToast
}) => {
  const [isImporterOpen, setIsImporterOpen] = useState<boolean>(false);
  const [logInput, setLogInput] = useState<string>('');
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const liveTrackerRef = useRef<Poe2RunTracker>(new Poe2RunTracker());

  const handleLiveLogLine = useCallback((line: string) => {
    const event = parsePoe2LogLine(line);
    if (!event) return;
    const transition = liveTrackerRef.current.processEvent(event);
    if (transition?.runCompleted) {
      const run = transition.runCompleted;
      onImportRuns([run]);
      onShowToast(`🎉 偵測到地圖結算：${run.mapName || '銘刻地圖'}！獲得 ${formatGold(run.goldEarned || 0)} 金幣`);
    } else if (transition?.runStarted) {
      onShowToast(`🗺️ 偵測到進入地圖：${transition.runStarted.mapName || '銘刻地圖'}`);
    }
  }, [onImportRuns, onShowToast]);

  useEffect(() => {
    if (!isTauri()) return;
    let unmounted = false;
    let unlisten: (() => void) | undefined;

    import('@tauri-apps/api/event').then(({ listen }) => {
      if (unmounted) return;
      setIsLiveActive(true);
      listen<{ text?: string } | string>('poe-client-log-line', ev => {
        const text = typeof ev.payload === 'string' ? ev.payload : ev.payload?.text;
        if (text) handleLiveLogLine(text);
      }).then(u => { unlisten = u; });
    }).catch(() => {});

    return () => {
      unmounted = true;
      if (unlisten) unlisten();
    };
  }, [handleLiveLogLine]);

  const handleParseAndImport = () => {
    if (!logInput.trim()) {
      onShowToast('請先貼上 Client.txt 日誌內容');
      return;
    }
    const tracker = new Poe2RunTracker();
    const parsedRuns = tracker.processLogText(logInput);
    if (parsedRuns.length === 0) {
      onShowToast('未在日誌中偵測到完整的地圖紀錄，請確認日誌包含 Entering area 與回城事件');
      return;
    }
    onImportRuns(parsedRuns);
    const totalG = parsedRuns.reduce((sum, r) => sum + (r.goldEarned || 0), 0);
    onShowToast(`✅ 成功匯入 ${parsedRuns.length} 場銘刻地圖紀錄！獲得 ${formatGold(totalG)} 金幣`);
    setLogInput('');
  };

  return (
    <div className="poe-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Coins size={22} color="#f3d179" />
          <h3 className="poe-font" style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-gold)' }}>
            PoE 2 金幣與終局資產收益 (Gold & Endgame Assets)
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', color: isLiveActive ? '#98c379' : 'var(--text-muted)' }}>
            <Radio size={14} className={isLiveActive ? 'animate-pulse' : ''} />
            {isLiveActive ? 'Client.txt 即時監聽中' : '支援日誌文字貼上匯入'}
          </span>
          <button
            type="button"
            className="poe-button-secondary"
            style={{ fontSize: '0.8rem', padding: '4px 10px' }}
            onClick={() => setIsImporterOpen(!isImporterOpen)}
          >
            <ScrollText size={14} style={{ marginRight: '4px' }} />
            {isImporterOpen ? '收合日誌解析器' : '開啟日誌解析器'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
        <MetricTile label="總累積金幣" value={formatGold(stats.totalGoldEarned || 0)} icon={<Coins size={16} color="#f3d179" />} color="var(--text-gold)" />
        <MetricTile label="金幣時薪 (活躍)" value={formatGoldPerHour(stats.activeMappingGoldPerHour || 0)} icon={<Flame size={16} color="#e5c07b" />} color="#e5c07b" />
        <MetricTile label="單場平均金幣" value={formatGold(stats.avgGoldPerRun || 0)} icon={<Coins size={16} color="#61afef" />} color="#61afef" />
        <MetricTile label="首領擊殺率" value={`${stats.totalBossSlain || 0} / ${runs.length} 場 (${stats.bossSlainRate || 0}%)`} icon={<Trophy size={16} color="#98c379" />} color="#98c379" />
        <MetricTile label="累積死亡數" value={`${stats.totalDeaths || 0} 次`} icon={<Skull size={16} color="#e06c75" />} color={stats.totalDeaths ? '#e06c75' : 'var(--text-muted)'} />
        <MetricTile label="銘刻地圖掉落" value={`${stats.totalWaystonesFound || 0} 張`} icon={<ScrollText size={16} color="#c678dd" />} color="#c678dd" />
        <MetricTile label="符文掉落" value={`${stats.totalRunesFound || 0} 顆`} icon={<CheckCircle2 size={16} color="#56b6c2" />} color="#56b6c2" />
      </div>

      {isImporterOpen && (
        <div style={{ backgroundColor: '#131720', borderRadius: '6px', padding: '14px', border: '1px solid rgba(243, 209, 121, 0.2)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            📋 請貼上 PoE 2 之 <code>Client.txt</code> 歷史日誌片段。系統將自動辨識地圖載入、金幣拾取、首領討伐與回城事件，並自動計算場次收益與時薪：
          </div>
          <textarea
            value={logInput}
            onChange={e => setLogInput(e.target.value)}
            rows={4}
            placeholder={`2024/12/06 18:20:00 [INFO Client] : Generating level 79 area "Riverside Bluff"
2024/12/06 18:20:05 [INFO Client] : Entering area Riverside Bluff
2024/12/06 18:21:00 [INFO Client] : You have received 2,400 Gold.
2024/12/06 18:22:30 [INFO Client] : Quest Complete: Defeat the Map Boss
2024/12/06 18:23:00 [INFO Client] : You have entered Hideout.`}
            style={{ width: '100%', backgroundColor: '#0e121a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '8px', fontSize: '0.8rem', fontFamily: 'monospace' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="poe-button-secondary" style={{ fontSize: '0.8rem' }} onClick={() => setLogInput('')}>
              清空
            </button>
            <button type="button" className="poe-button-primary" style={{ fontSize: '0.8rem' }} onClick={handleParseAndImport}>
              解析並匯入刷圖紀錄
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricTile: React.FC<{ label: string; value: string; icon: React.ReactNode; color: string }> = ({
  label, value, icon, color
}) => (
  <div style={{ backgroundColor: '#161b26', padding: '10px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
      {icon}
      <span>{label}</span>
    </div>
    <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color }}>{value}</div>
  </div>
);
