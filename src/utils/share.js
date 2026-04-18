// share.js — LZ-string compress + base64 URL share

import LZString from 'lz-string';

export function encodeShare(grid, settings) {
  const text = grid.map(row => row.map(c => c.char).join('')).join('\n');
  const payload = JSON.stringify({
    ascii: text,
    mode: settings.renderMode,
    bg: settings.bgColor,
    fg: settings.textColor,
    fs: settings.fontSize,
    ff: settings.fontFamily,
  });
  const compressed = LZString.compressToEncodedURIComponent(payload);
  return `${window.location.origin}${window.location.pathname}#data=${compressed}`;
}

export function decodeShare(hash) {
  try {
    const match = hash.match(/#data=(.+)/);
    if (!match) return null;
    const decompressed = LZString.decompressFromEncodedURIComponent(match[1]);
    return JSON.parse(decompressed);
  } catch {
    return null;
  }
}
