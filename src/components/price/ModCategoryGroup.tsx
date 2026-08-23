import React from 'react';
import type { ParsedItemMod } from '../../types/poe';
import { ModFilterRow } from './ModFilterRow';

interface ModCategoryGroupProps {
  title: string;
  badgeColor: string;
  badgeBg: string;
  items: { mod: ParsedItemMod; originalIndex: number }[];
  onToggleMod: (index: number) => void;
  onChangeMinValue: (index: number, val: number | undefined) => void;
  onChangeMaxValue: (index: number, val: number | undefined) => void;
  formatModText: (mod: ParsedItemMod) => string;
  onRemoveMod?: (index: number) => void;
}

export const ModCategoryGroup: React.FC<ModCategoryGroupProps> = ({
  title,
  badgeColor,
  badgeBg,
  items,
  onToggleMod,
  onChangeMinValue,
  onChangeMaxValue,
  formatModText,
  onRemoveMod
}) => {
  if (items.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0 2px' }}>
        <span
          style={{
            fontSize: '0.72rem',
            padding: '2px 6px',
            borderRadius: '4px',
            background: badgeBg,
            color: badgeColor,
            fontWeight: 600
          }}
        >
          {title}
        </span>
      </div>
      {items.map(({ mod, originalIndex }) => (
        <ModFilterRow
          key={mod.id || originalIndex}
          mod={mod}
          index={originalIndex}
          onToggleMod={onToggleMod}
          onChangeMinValue={onChangeMinValue}
          onChangeMaxValue={onChangeMaxValue}
          formatModText={formatModText}
          onRemoveMod={onRemoveMod}
        />
      ))}
    </div>
  );
};
