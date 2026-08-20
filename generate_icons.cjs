const fs = require('fs');

const generatePNG = (size) => {
  // 1x1 transparent PNG base64
  const base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  const buffer = Buffer.from(base64, 'base64');
  return buffer;
};

fs.writeFileSync('public/icon-192x192.png', generatePNG(192));
fs.writeFileSync('public/icon-512x512.png', generatePNG(512));
console.log('Dummy PNGs created');
