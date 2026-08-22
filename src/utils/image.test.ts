import { describe, it, expect } from 'vitest';
import { getImageUrl } from './image';

describe('getImageUrl utility', () => {
  it('returns empty string when url is undefined or empty', () => {
    expect(getImageUrl(undefined)).toBe('');
    expect(getImageUrl('')).toBe('');
  });

  it('returns original url if it starts with http:// or https://', () => {
    expect(getImageUrl('https://web.poecdn.com/image.png')).toBe('https://web.poecdn.com/image.png');
    expect(getImageUrl('http://example.com/item.png')).toBe('http://example.com/item.png');
  });

  it('prepends web.poecdn.com domain if it is a relative path starting with /', () => {
    expect(getImageUrl('/gen/image/WzI...')).toBe('https://web.poecdn.com/gen/image/WzI...');
  });

  it('prepends web.poecdn.com domain if it is a relative path without leading /', () => {
    expect(getImageUrl('gen/image/WzI...')).toBe('https://web.poecdn.com/gen/image/WzI...');
  });
});
