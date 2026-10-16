const path = require('path');
const sharp = require(path.join(__dirname, '../frontend/node_modules/sharp'));

const ornamentsDir = path.join(__dirname, '../frontend/public/ornaments');

async function cleanOrnament(filename, outputName) {
  const inputPath = path.join(ornamentsDir, filename);
  const outputPath = path.join(ornamentsDir, outputName);

  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const outBuf = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];

    // Check if it's the gold/bronze stroke:
    // Gold strokes have distinct warmth (R is higher than B by at least 25)
    // and are darker than white (r < 240)
    const diffRB = r - b;
    const diffRG = r - g;

    if (diffRB > 20 && diffRG > 8 && (r + g + b) / 3 < 245) {
      // Golden line pixel!
      // Keep the gold color and set alpha based on color strength
      outBuf[i * 4] = 195;     // Gold R
      outBuf[i * 4 + 1] = 145; // Gold G
      outBuf[i * 4 + 2] = 85;  // Gold B
      // calculate alpha
      const strength = Math.min(255, Math.max(50, diffRB * 4));
      outBuf[i * 4 + 3] = strength;
    } else {
      // Checkerboard/white background -> transparent
      outBuf[i * 4] = 0;
      outBuf[i * 4 + 1] = 0;
      outBuf[i * 4 + 2] = 0;
      outBuf[i * 4 + 3] = 0;
    }
  }

  await sharp(outBuf, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(outputPath);

  console.log(`Successfully cleaned ${outputName}`);
}

async function run() {
  await cleanOrnament('mandala_corner.png', 'clean_mandala.png');
  await cleanOrnament('yantra_wheel.png', 'clean_yantra.png');
  await cleanOrnament('floral_divider.png', 'clean_divider.png');
}

run().catch(console.error);
