import React, { useState } from 'react';
import type { CharacterClass } from '../domain/acts/types';
import { ACT_GUIDE_DATA } from '../domain/acts/actGuideData';
import { ActSelector } from './acts/ActSelector';
import { ClassRewardFilter } from './acts/ClassRewardFilter';
import { ActStepList } from './acts/ActStepList';
import { ActCheckpoints } from './acts/ActCheckpoints';
import { ActGemSwapCheckpoints } from './acts/ActGemSwapCheckpoints';
import { ActMiniOverlay } from './acts/ActMiniOverlay';
import type { IStoragePort } from '../application/ports/IStoragePort';
import { defaultStorage } from '../infrastructure/storage/LocalStorageAdapter';
import { Map, RotateCcw, Sparkles, Zap } from 'lucide-react';

interface ActLevelingGuideProps {
  onShowToast: (msg: string) => void;
  storage?: IStoragePort;
}

const STORAGE_KEY_PROGRESS = 'poe_act_guide_completed_steps';
const STORAGE_KEY_CLASS = 'poe_act_guide_selected_class';
const STORAGE_KEY_GEMS = 'poe_act_guide_completed_gems';

export const ActLevelingGuide: React.FC<ActLevelingGuideProps> = ({
  onShowToast,
  storage = defaultStorage
}) => {
  const [currentActNum, setCurrentActNum] = useState<number>(1);
  const [selectedClass, setSelectedClass] = useState<CharacterClass>(() => {
    return storage.getItem<CharacterClass>(STORAGE_KEY_CLASS, 'witch');
  });

  const [completedSteps, setCompletedSteps] = useState<Set<string>>(() => {
    const saved = storage.getItem<string[] | null>(STORAGE_KEY_PROGRESS, null);
    if (Array.isArray(saved)) {
      return new Set(saved);
    }
    return new Set();
  });

  const [completedGems, setCompletedGems] = useState<Set<string>>(() => {
    const saved = storage.getItem<string[] | null>(STORAGE_KEY_GEMS, null);
    return Array.isArray(saved) ? new Set(saved) : new Set();
  });

  const [activeGuideTab, setActiveGuideTab] = useState<'steps' | 'gems'>('steps');
  const [isMiniHudOpen, setIsMiniHudOpen] = useState<boolean>(false);

  // Sync class selection
  const handleSelectClass = (cls: CharacterClass) => {
    setSelectedClass(cls);
    storage.setItem(STORAGE_KEY_CLASS, cls);
    onShowToast(`🧙‍♂️ 已切換起手職業為：${cls.toUpperCase()}`);
  };

  // Toggle step completion
  const handleToggleStep = (stepId: string) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      storage.setItem(STORAGE_KEY_PROGRESS, Array.from(next));
      return next;
    });
  };

  // Toggle gem swap completion
  const handleToggleGem = (gemId: string) => {
    setCompletedGems(prev => {
      const next = new Set(prev);
      if (next.has(gemId)) {
        next.delete(gemId);
      } else {
        next.add(gemId);
      }
      storage.setItem(STORAGE_KEY_GEMS, Array.from(next));
      return next;
    });
  };

  const handleResetProgress = () => {
    if (window.confirm('確定要重置所有章節的拓荒完成進度嗎？')) {
      setCompletedSteps(new Set());
      setCompletedGems(new Set());
      storage.removeItem(STORAGE_KEY_PROGRESS);
      storage.removeItem(STORAGE_KEY_GEMS);
      onShowToast('🔄 已重置所有章節拓荒進度！');
    }
  };

  const currentActData = ACT_GUIDE_DATA.find(a => a.act === currentActNum) || ACT_GUIDE_DATA[0];

  // Calculate total steps and passive points earned
  let totalSteps = 0;
  let passivePointsEarned = 0;

  ACT_GUIDE_DATA.forEach(act => {
    act.steps.forEach(step => {
      totalSteps += 1;
      if (step.isPassivePoint && completedSteps.has(step.id)) {
        // Act 10 kitava gives 2 points, others give 1
        passivePointsEarned += (step.id === 'act10_kitava_final' ? 2 : 1);
      }
    });
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Map size={24} color="var(--text-gold)" />
            <h1 className="poe-font" style={{ fontSize: '1.45rem', color: 'var(--text-gold)', margin: 0, letterSpacing: '0.5px' }}>
              拓荒章節快速攻略助手 (Act Leveling Guide)
            </h1>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Act 1 ~ 10 最速通關路線、24 點天賦點任務防漏檢核、全職業任務獎勵選取建議與抗性檢查點
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setIsMiniHudOpen(!isMiniHudOpen)}
            className={isMiniHudOpen ? 'poe-button' : 'poe-button-secondary'}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={15} /> {isMiniHudOpen ? '關閉極簡 HUD' : '開啟極簡置頂 HUD'}
          </button>

          <button
            type="button"
            onClick={handleResetProgress}
            className="poe-button-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}
            title="重置進度"
          >
            <RotateCcw size={14} /> 重置進度
          </button>
        </div>
      </div>

      {/* Act Horizontal Navigation Bar */}
      <ActSelector
        currentAct={currentActNum}
        onSelectAct={act => setCurrentActNum(act)}
        completedStepCount={completedSteps.size}
        totalStepCount={totalSteps}
        passivePointsEarned={passivePointsEarned}
      />

      {/* Class Reward Picker Filter */}
      <ClassRewardFilter
        selectedClass={selectedClass}
        onSelectClass={handleSelectClass}
      />

      {/* View Switcher: Steps vs Gem Swap Checkpoints */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(200, 170, 110, 0.2)', paddingBottom: '8px' }}>
        <button
          type="button"
          onClick={() => setActiveGuideTab('steps')}
          className={activeGuideTab === 'steps' ? 'poe-button' : 'poe-button-secondary'}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem' }}
        >
          <Map size={15} /> 地圖走法與任務步驟
        </button>
        <button
          type="button"
          onClick={() => setActiveGuideTab('gems')}
          className={activeGuideTab === 'gems' ? 'poe-button' : 'poe-button-secondary'}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem' }}
        >
          <Zap size={15} /> 技能與裝備轉換里程碑 (Gem Swaps)
        </button>
      </div>

      {activeGuideTab === 'gems' ? (
        <ActGemSwapCheckpoints
          selectedClass={selectedClass}
          completedGemIds={completedGems}
          onToggleGem={handleToggleGem}
        />
      ) : (
        <>
          {/* Act Checkpoints & Bandit / Ascendancy Advice */}
          <ActCheckpoints actData={currentActData} />

          {/* Detailed Step List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 className="poe-font" style={{ fontSize: '1.05rem', color: 'var(--text-gold)', margin: 0 }}>
                {currentActData.title} - 地圖走法與任務步驟
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                已完成 {currentActData.steps.filter(s => completedSteps.has(s.id)).length} / {currentActData.steps.length} 步驟
              </span>
            </div>

            <ActStepList
              steps={currentActData.steps}
              completedSteps={completedSteps}
              onToggleStep={handleToggleStep}
              selectedClass={selectedClass}
            />
          </div>
        </>
      )}

      {/* Floating Mini Overlay HUD */}
      <ActMiniOverlay
        isOpen={isMiniHudOpen}
        onClose={() => setIsMiniHudOpen(false)}
        actData={currentActData}
        completedSteps={completedSteps}
        onToggleStep={handleToggleStep}
        selectedClass={selectedClass}
        onPrevAct={() => setCurrentActNum(a => Math.max(a - 1, 1))}
        onNextAct={() => setCurrentActNum(a => Math.min(a + 1, 10))}
        completedGemIds={completedGems}
        onToggleGem={handleToggleGem}
      />
    </div>
  );
};

export default ActLevelingGuide;
