
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeaponSwapIndicator } from '../WeaponSwapIndicator';
import { DualWeaponStorage } from '../../../infrastructure/storage/dualWeaponStorage';
import type { BoundSkill, DualWeaponLoadout } from '../../../domain/dualSpec';

describe('WeaponSwapIndicator Component', () => {
  beforeEach(() => {
    localStorage.clear();
    DualWeaponStorage.clear();
  });

  it('renders correctly with default empty weapon sets', () => {
    render(<WeaponSwapIndicator />);

    expect(screen.getByTestId('weapon-swap-indicator')).toBeInTheDocument();
    expect(screen.getByText('PoE 2 武器組')).toBeInTheDocument();
    expect(screen.getByTestId('set1-button')).toHaveTextContent('組別 1: 空手 (Unarmed)');
    expect(screen.getByTestId('set2-button')).toHaveTextContent('組別 2: 空手 (Unarmed)');
  });

  it('switches weapon set when set buttons are clicked', () => {
    const onSwapSet = vi.fn();
    render(<WeaponSwapIndicator onSwapSet={onSwapSet} />);

    const set2Button = screen.getByTestId('set2-button');
    fireEvent.click(set2Button);

    expect(onSwapSet).toHaveBeenCalledWith('Set2');
  });

  it('toggles compact mode on chevron click', () => {
    render(<WeaponSwapIndicator />);

    const compactToggle = screen.getByTestId('compact-toggle');
    expect(screen.getByText(/主手:/)).toBeInTheDocument();

    fireEvent.click(compactToggle);
    expect(screen.queryByText(/主手:/)).not.toBeInTheDocument();

    fireEvent.click(compactToggle);
    expect(screen.getByText(/主手:/)).toBeInTheDocument();
  });

  it('displays incompatible skills alert when skill requirement fails', () => {
    const mockLoadout: DualWeaponLoadout = {
      set1: {
        mainHand: {
          id: 'wand_1',
          name: '魔杖',
          baseType: '魔杖',
          weaponType: 'Wand',
          category: 'OneHanded',
          isTwoHanded: false
        },
        offHand: null
      },
      set2: { mainHand: null, offHand: null },
      activeSet: 'Set1'
    };
    DualWeaponStorage.saveLoadout(mockLoadout);

    const skills: BoundSkill[] = [
      {
        id: 'shield_skill',
        name: '盾牌衝擊',
        preference: 'Set1',
        resolvedSet: 'Set1',
        isCompatible: false,
        incompatibilityReason: '需要盾牌',
        requirements: { requiresShield: true }
      }
    ];

    render(<WeaponSwapIndicator initialSkills={skills} />);

    expect(screen.getByTestId('incompatible-skills-alert')).toBeInTheDocument();
    expect(screen.getByText(/盾牌衝擊/)).toBeInTheDocument();
  });

  it('expands delta matrix table on button click', () => {
    render(<WeaponSwapIndicator />);

    const deltaToggle = screen.getByTestId('delta-matrix-toggle');
    expect(screen.queryByTestId('delta-matrix-table')).not.toBeInTheDocument();

    fireEvent.click(deltaToggle);
    expect(screen.getByTestId('delta-matrix-table')).toBeInTheDocument();
    expect(screen.getByText('每秒攻擊 (APS)')).toBeInTheDocument();

    fireEvent.click(deltaToggle);
    expect(screen.queryByTestId('delta-matrix-table')).not.toBeInTheDocument();
  });
});
