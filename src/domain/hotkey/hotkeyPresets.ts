import type { HotkeyActionDef, HotkeyPreset } from './types';

export const HOTKEY_ACTIONS: HotkeyActionDef[] = [
  { id: 'priceCheck', nameZh: '物品即時查價', description: '複製游標下裝備並觸發查價面板', defaultKey: 'ctrl+d' },
  { id: 'dangerCheck', nameZh: '地圖致命詞綴檢測', description: '即時掃描地圖反傷/無法偷取等危險詞綴', defaultKey: 'ctrl+m' },
  { id: 'whisperReply', nameZh: '快速交易密語回覆', description: '開啟或回覆最新買家交易密語', defaultKey: 'ctrl+enter' },
  { id: 'overlayPin', nameZh: '懸浮視窗置頂釘選', description: '固定懸浮小卡，防止點擊失焦自動關閉', defaultKey: 'f10' }
];

export const HOTKEY_PRESETS: HotkeyPreset[] = [
  {
    id: 'standard',
    nameZh: '標準經典配置 (Awakened 習慣)',
    description: '經典 Ctrl+D 查價與 F10 釘選，適合絕大多數 PoE 玩家',
    bindings: {
      priceCheck: 'ctrl+d',
      dangerCheck: 'ctrl+m',
      whisperReply: 'ctrl+enter',
      overlayPin: 'f10'
    }
  },
  {
    id: 'left_hand',
    nameZh: '左手人體工學 (單手集中區)',
    description: '按鍵全集中於 Q/W/E/Space，右手鼠標全程無需移位',
    bindings: {
      priceCheck: 'ctrl+q',
      dangerCheck: 'ctrl+w',
      whisperReply: 'ctrl+e',
      overlayPin: 'ctrl+space'
    }
  },
  {
    id: 'numpad_mmo',
    nameZh: '數字鍵盤側鍵 (MMO 滑鼠輔助)',
    description: '適合具備 12 鍵側鍵的 MMO 電競滑鼠快速單鍵觸發',
    bindings: {
      priceCheck: 'num1',
      dangerCheck: 'num2',
      whisperReply: 'num3',
      overlayPin: 'num0'
    }
  },
  {
    id: 'alt_single_mod',
    nameZh: 'Alt 鍵單純映射',
    description: '避免與遊戲內 Ctrl 快捷衝突，改用 Alt 鍵組合',
    bindings: {
      priceCheck: 'alt+d',
      dangerCheck: 'alt+m',
      whisperReply: 'alt+r',
      overlayPin: 'alt+p'
    }
  },
  {
    id: 'function_keys',
    nameZh: '功能鍵直覺配置 (F2-F5)',
    description: '使用頂部 F 功能鍵單鍵快速觸發，無修飾鍵負擔',
    bindings: {
      priceCheck: 'f2',
      dangerCheck: 'f3',
      whisperReply: 'f4',
      overlayPin: 'f5'
    }
  }
];

export function getDefaultBindings() {
  return { ...HOTKEY_PRESETS[0].bindings };
}
