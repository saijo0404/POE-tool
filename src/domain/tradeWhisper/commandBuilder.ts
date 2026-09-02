function sanitizePlayerName(player: string): string {
  return player.replace(/<[^>]+>/g, '').trim();
}

export function buildInviteCommand(player: string): string {
  const name = sanitizePlayerName(player);
  return `/invite ${name}`;
}

export function buildWaitCommand(player: string, template?: string): string {
  const name = sanitizePlayerName(player);
  const msg = template?.trim() || '正在刷圖中，請稍候 1 分鐘！';
  return `@${name} ${msg}`;
}

export function buildTradeCommand(player: string): string {
  const name = sanitizePlayerName(player);
  return `/tradewith ${name}`;
}

export function buildKickCommand(player: string): string {
  const name = sanitizePlayerName(player);
  return `/kick ${name}`;
}

export function buildThanksCommand(player: string, template?: string): string {
  const name = sanitizePlayerName(player);
  const msg = template?.trim() || 'ty gl!';
  return `@${name} ${msg}`;
}

export function buildThanksAndKickCommands(player: string, template?: string): string[] {
  return [buildThanksCommand(player, template), buildKickCommand(player)];
}

export function buildHideoutCommand(): string {
  return '/hideout';
}
