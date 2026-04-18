// export.js — PNG, SVG, HTML, TXT export functions

import { saveAs } from 'file-saver';

const FONT_ASPECT = 0.6; // monospace char width/height ratio

export function exportPNG(grid, settings, scale = 2) {
  const { fontSize, lineHeight, fontFamily, bgColor } = settings;
  const cols = grid[0]?.length || 0;
  const rows = grid.length;

  const charW = Math.ceil(fontSize * FONT_ASPECT * scale);
  const charH = Math.ceil(fontSize * lineHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = cols * charW;
  canvas.height = rows * charH;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bgColor || '#0a0a0a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const fontStr = `${settings.bold ? 'bold ' : ''}${fontSize * scale}px "${fontFamily || 'Courier New'}", monospace`;
  ctx.font = fontStr;
  ctx.textBaseline = 'top';

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = grid[row][col];
      if (cell.char === ' ') continue;
      ctx.fillStyle = cell.color || '#33ff33';
      ctx.fillText(cell.char, col * charW, row * charH);
    }
  }

  canvas.toBlob(blob => saveAs(blob, `asscam_${Date.now()}.png`), 'image/png');
  return canvas;
}

export function exportSVG(grid, settings) {
  const { fontSize, lineHeight, fontFamily, bgColor } = settings;
  const cols = grid[0]?.length || 0;
  const rows = grid.length;
  const charW = fontSize * FONT_ASPECT;
  const charH = fontSize * lineHeight;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * charW}" height="${rows * charH}">`;
  svg += `<rect width="100%" height="100%" fill="${bgColor || '#0a0a0a'}"/>`;
  svg += `<text font-family="${fontFamily || 'Courier New'}, monospace" font-size="${fontSize}" ${settings.bold ? 'font-weight="bold"' : ''}>`;

  for (let row = 0; row < rows; row++) {
    svg += `<tspan x="0" dy="${row === 0 ? charH : charH}">`;
    for (let col = 0; col < cols; col++) {
      const cell = grid[row][col];
      const escaped = cell.char.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      svg += `<tspan fill="${cell.color || '#33ff33'}">${escaped || ' '}</tspan>`;
    }
    svg += '</tspan>';
  }

  svg += '</text></svg>';

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  saveAs(blob, `asscam_${Date.now()}.svg`);
}

export function exportHTML(grid, settings) {
  const { fontSize, lineHeight, letterSpacing, fontFamily, bgColor, bold } = settings;
  const lines = grid.map(row =>
    '<div>' + row.map(cell =>
      `<span style="color:${cell.color || '#33ff33'}">${
        cell.char === ' ' ? '&nbsp;' :
        cell.char === '<' ? '&lt;' :
        cell.char === '>' ? '&gt;' :
        cell.char === '&' ? '&amp;' :
        cell.char
      }</span>`
    ).join('') + '</div>'
  ).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>ASSCam Export</title>
  <style>
    body { margin: 0; background: ${bgColor || '#0a0a0a'}; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    pre { font-family: "${fontFamily || 'Courier New'}", monospace; font-size: ${fontSize}px; line-height: ${lineHeight}; letter-spacing: ${letterSpacing}px; ${bold ? 'font-weight:bold;' : ''} margin: 0; }
  </style>
</head>
<body><pre>${lines}</pre></body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  saveAs(blob, `asscam_${Date.now()}.html`);
}

export function exportTXT(grid) {
  const text = grid.map(row => row.map(c => c.char).join('')).join('\n');
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `asscam_${Date.now()}.txt`);
}

export async function copyTextToClipboard(grid) {
  const text = grid.map(row => row.map(c => c.char).join('')).join('\n');
  await navigator.clipboard.writeText(text);
}

export async function copyImageToClipboard(grid, settings) {
  const canvas = exportPNG(grid, settings, 2);
  // Note: actual save is already triggered; this is for clipboard
  canvas.toBlob(async blob => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
    } catch (e) {
      console.warn('Image clipboard not supported', e);
    }
  });
}
