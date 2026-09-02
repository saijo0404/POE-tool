import { describe, it, expect } from 'vitest';
import {
  buildInviteCommand,
  buildWaitCommand,
  buildTradeCommand,
  buildKickCommand,
  buildThanksCommand,
  buildThanksAndKickCommands,
  buildHideoutCommand
} from '../commandBuilder';

describe('commandBuilder (TDD)', () => {
  const player = 'SuperBuyer';

  it('builds invite command correctly', () => {
    expect(buildInviteCommand(player)).toBe('/invite SuperBuyer');
  });

  it('builds wait command with default template', () => {
    expect(buildWaitCommand(player)).toBe('@SuperBuyer 正在刷圖中，請稍候 1 分鐘！');
  });

  it('builds wait command with custom template', () => {
    expect(buildWaitCommand(player, '請稍候 2 分鐘，馬上出來！')).toBe('@SuperBuyer 請稍候 2 分鐘，馬上出來！');
  });

  it('builds trade command correctly', () => {
    expect(buildTradeCommand(player)).toBe('/tradewith SuperBuyer');
  });

  it('builds kick command correctly', () => {
    expect(buildKickCommand(player)).toBe('/kick SuperBuyer');
  });

  it('builds thanks command correctly', () => {
    expect(buildThanksCommand(player)).toBe('@SuperBuyer ty gl!');
    expect(buildThanksCommand(player, '多謝老闆！')).toBe('@SuperBuyer 多謝老闆！');
  });

  it('builds thanks and kick compound command list', () => {
    const cmds = buildThanksAndKickCommands(player);
    expect(cmds).toEqual(['@SuperBuyer ty gl!', '/kick SuperBuyer']);
  });

  it('builds hideout command correctly', () => {
    expect(buildHideoutCommand()).toBe('/hideout');
  });

  it('sanitizes player names with brackets or whitespace', () => {
    expect(buildInviteCommand('  <Guild> RealName  ')).toBe('/invite RealName');
    expect(buildTradeCommand('  RealName  ')).toBe('/tradewith RealName');
  });
});
