import React from 'react';
import type { CharacterClass } from '../../domain/acts/types';
import { UserCheck } from 'lucide-react';

interface ClassRewardFilterProps {
  selectedClass: CharacterClass;
  onSelectClass: (cls: CharacterClass) => void;
}

const CLASSES: { key: CharacterClass; label: string; icon: string; color: string }[] = [
  { key: 'witch', label: '女巫 (Witch)', icon: '🔮', color: '#38bdf8' },
  { key: 'shadow', label: '暗影 (Shadow)', icon: '🗡️', color: '#22c55e' },
  { key: 'ranger', label: '遊俠 (Ranger)', icon: '🏹', color: '#4ade80' },
  { key: 'duelist', label: '決鬥者 (Duelist)', icon: '⚔️', color: '#fb923c' },
  { key: 'marauder', label: '野蠻人 (Marauder)', icon: '🪓', color: '#ef4444' },
  { key: 'templar', label: '聖堂武僧 (Templar)', icon: '🛡️', color: '#facc15' },
  { key: 'scion', label: '貴族 (Scion)', icon: '👑', color: '#e879f9' }
];

export const ClassRewardFilter: React.FC<ClassRewardFilterProps> = ({
  selectedClass,
  onSelectClass
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'rgba(10, 14, 22, 0.85)',
      border: '1px solid rgba(200, 170, 110, 0.25)',
      borderRadius: '6px',
      padding: '8px 14px',
      flexWrap: 'wrap',
      gap: '10px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <UserCheck size={16} color="var(--text-gold)" />
        <span style={{ fontSize: '0.82rem', color: 'var(--text-gold)', fontWeight: 600 }}>
          當前起手職業 (自動高亮任務技能與裝備)：
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {CLASSES.map(cls => {
          const isSelected = selectedClass === cls.key;
          return (
            <button
              key={cls.key}
              type="button"
              onClick={() => onSelectClass(cls.key)}
              style={{
                backgroundColor: isSelected ? 'rgba(243, 209, 121, 0.25)' : 'rgba(20, 26, 40, 0.6)',
                border: `1px solid ${isSelected ? 'var(--border-gold)' : 'rgba(255, 255, 255, 0.1)'}`,
                color: isSelected ? '#ffffff' : 'var(--text-muted)',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{cls.icon}</span>
              <span style={{ fontWeight: isSelected ? 600 : 400 }}>{cls.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
