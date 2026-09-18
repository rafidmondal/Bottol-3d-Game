const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 implementation
function makeCRCTable() {
  let c;
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }
  return crcTable;
}
const crcTable = makeCRCTable();
function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function writePNG(width, height, isMaskable = false) {
  const rowSize = width * 4 + 1; // 1 filter byte per scanline
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const rOuter = width * 0.46;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default dark theme background (#0f172a)
      let r = 15;
      let g = 23;
      let b = 42;
      let a = 255;

      // Radial dark gradient
      const gradFactor = Math.min(dist / (width * 0.5), 1.0);
      r = Math.floor(15 * (1 - gradFactor * 0.4));
      g = Math.floor(23 * (1 - gradFactor * 0.4));
      b = Math.floor(42 * (1 - gradFactor * 0.4));

      // Outer cyan ring
      if (Math.abs(dist - rOuter * 0.9) < width * 0.015) {
        r = 56; g = 189; b = 248; // #38bdf8
      }

      // Flip arc trail (golden yellow)
      const angle = Math.atan2(dy, dx);
      if (dist > width * 0.28 && dist < width * 0.33 && angle > -Math.PI * 0.8 && angle < 0.2) {
        r = 250; g = 204; b = 21; // #facc15
      }

      // Bottle body (rotated roughly in center)
      // Rotate coordinates by +18 deg to draw upright bottle
      const rad = -18 * Math.PI / 180;
      const cosR = Math.cos(-rad);
      const sinR = Math.sin(-rad);
      const bx = cosR * dx - sinR * (dy + height * 0.02);
      const by = sinR * dx + cosR * (dy + height * 0.02);

      const halfBW = width * 0.14;
      const bottleTopY = -height * 0.22;
      const bottleNeckY = -height * 0.12;
      const bottleBottomY = height * 0.22;

      // Bottle Cap (red)
      if (Math.abs(bx) < halfBW * 0.5 && by >= bottleTopY && by < bottleTopY + height * 0.04) {
        r = 239; g = 68; b = 68; // Red #ef4444
      }
      // Bottle Neck
      else if (Math.abs(bx) < halfBW * 0.38 && by >= bottleTopY + height * 0.04 && by < bottleNeckY) {
        r = 56; g = 189; b = 248; // Light cyan glass
      }
      // Bottle Body Glass & Liquid
      else if (Math.abs(bx) < halfBW && by >= bottleNeckY && by <= bottleBottomY) {
        // Label in center
        if (Math.abs(bx) < halfBW * 0.88 && by >= -height * 0.03 && by <= height * 0.07) {
          r = 15; g = 23; b = 42; // dark label #0f172a
          // Label border
          if (Math.abs(bx) > halfBW * 0.78 || Math.abs(by - height * 0.02) > height * 0.04) {
            r = 56; g = 189; b = 248;
          }
        } else if (by > height * 0.02) {
          // Blue liquid
          r = 2; g = 132; b = 199; // #0284c7
        } else {
          // Cyan glass
          r = 14; g = 165; b = 233; // #0ea5e9
        }
        // White specular reflection along left edge
        if (bx >= -halfBW * 0.85 && bx <= -halfBW * 0.65) {
          r = Math.min(r + 140, 255);
          g = Math.min(g + 140, 255);
          b = Math.min(b + 140, 255);
        }
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // Compress IDAT
  const compressed = zlib.deflateSync(rawData);

  // Build PNG chunk helper
  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const toCrc = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(toCrc), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve(__dirname, '../public');

// Generate icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), writePNG(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), writePNG(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), writePNG(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), writePNG(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), writePNG(64, 64, false));

console.log('PWA PNG assets successfully generated in public directory.');
