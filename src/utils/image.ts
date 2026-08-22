export function getImageUrl(url?: string): string {
  if (!url) return '';
  
  // If it's already a full URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If it's a relative PoE CDN path like /gen/image/WzI... or gen/image/WzI...
  const cleanPath = url.replace(/^\//, '');
  return `https://web.poecdn.com/${cleanPath}`;
}
