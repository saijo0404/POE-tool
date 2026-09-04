import { DomainError } from '../errors/DomainError';
import { ok, err, type Result } from '../errors/Result';

export type WhisperCategory = 'wait' | 'busy' | 'sold' | 'thanks' | 'custom';

export interface WhisperTemplate {
  id: string;
  label: string;
  message: string;
  category: WhisperCategory;
  isDefault?: boolean;
}

export interface WhisperTemplateParams {
  buyer: string;
  item?: string;
  price?: string;
  stashTab?: string;
}

export const DEFAULT_WHISPER_TEMPLATES: readonly WhisperTemplate[] = [
  {
    id: 'tpl-wait-map',
    label: '⏳ 刷圖中稍候',
    message: '正在刷圖中，請稍等約 1 分鐘！',
    category: 'wait',
    isDefault: true
  },
  {
    id: 'tpl-bossing',
    label: '⚔️ 打王攻堅中',
    message: '正在打王攻堅，結束後立即邀請您！',
    category: 'busy',
    isDefault: true
  },
  {
    id: 'tpl-sold',
    label: '🚪 物品已售出',
    message: '抱歉 {buyer}，{item} 已售出，祝遊戲愉快！',
    category: 'sold',
    isDefault: true
  },
  {
    id: 'tpl-thanks',
    label: '🤝 感謝交易',
    message: '感謝交易！祝打寶運昌隆 (ty gl)!',
    category: 'thanks',
    isDefault: true
  },
  {
    id: 'tpl-busy-party',
    label: '🌀 五軍/組隊中',
    message: '正在五軍組隊中，稍後回覆您！',
    category: 'busy',
    isDefault: true
  }
];

export function getDefaultWhisperTemplates(): WhisperTemplate[] {
  return DEFAULT_WHISPER_TEMPLATES.map(t => ({ ...t }));
}

function sanitizePlayerName(player: string): string {
  return player.replace(/<[^>]+>/g, '').trim();
}

export function interpolateWhisperTemplate(
  template: string,
  params: Partial<WhisperTemplateParams> = {}
): string {
  const buyer = params.buyer ? sanitizePlayerName(params.buyer) : '';
  const item = params.item?.trim() || '';
  const price = params.price?.trim() || '';
  const stash = params.stashTab?.trim() || '';

  return template
    .replace(/\{buyer\}/g, buyer)
    .replace(/\{item\}/g, item)
    .replace(/\{price\}/g, price)
    .replace(/\{stash\}/g, stash)
    .replace(/([，。！？])\s+/g, '$1')
    .replace(/\s+([，。！？])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function buildWhisperResponseCommand(
  player: string,
  template: string,
  params?: Partial<WhisperTemplateParams>
): string {
  const name = sanitizePlayerName(player);
  const resolvedParams: Partial<WhisperTemplateParams> = {
    buyer: name,
    ...params
  };
  const body = interpolateWhisperTemplate(template, resolvedParams);
  return `@${name} ${body}`;
}

export function validateWhisperTemplate(
  tpl: Partial<WhisperTemplate>
): Result<WhisperTemplate, DomainError> {
  if (!tpl.id || typeof tpl.id !== 'string' || !tpl.id.trim()) {
    return err(DomainError.validation('範本 ID 不能為空'));
  }
  const label = tpl.label?.trim() || '';
  if (!label || label.length > 30) {
    return err(DomainError.validation('範本標籤長度需介於 1 至 30 字元'));
  }
  const message = tpl.message?.trim() || '';
  if (!message || message.length > 200) {
    return err(DomainError.validation('範本內容長度需介於 1 至 200 字元'));
  }
  const category = tpl.category || 'custom';
  return ok({
    id: tpl.id.trim(),
    label,
    message,
    category,
    isDefault: !!tpl.isDefault
  });
}

export function mergeWhisperTemplates(
  saved?: WhisperTemplate[] | null
): WhisperTemplate[] {
  if (!saved || saved.length === 0) {
    return getDefaultWhisperTemplates();
  }
  const defaults = getDefaultWhisperTemplates();
  const customList = saved.filter(s => !defaults.some(d => d.id === s.id));
  return [...defaults, ...customList];
}
