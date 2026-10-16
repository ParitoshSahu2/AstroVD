const path = require('path');
const sharp = require(path.join(__dirname, '../frontend/node_modules/sharp'));

const ornamentsDir = path.join(__dirname, '../frontend/public/ornaments');

async function removeWhiteBg(filename, outputName, threshold = 240) {
  const inputPath = path.join(ornamentsDir, filename);
  const outputPath = path.join(ornamentsDir, outputName);

  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const outBuf = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];

    const brightness = (r + g + b) / 3;

    outBuf[i * 4] = r;
    outBuf[i * 4 + 1] = g;
    outBuf[i * 4 + 2] = b;

    if (brightness > threshold) {
      // smooth alpha fade near white edge
      const alpha = Math.max(0, Math.min(255, (255 - brightness) * (255 / (255 - threshold))));
      outBuf[i * 4 + 3] = Math.round(alpha);
    } else {
      outBuf[i * 4 + 3] = 255;
    }
  }

  await sharp(outBuf, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(outputPath);

  console.log(`Saved transparent ${outputName}`);
}

async function run() {
  await removeWhiteBg('plant_foliage.jpg', 'transparent_plant.png', 235);
  await removeWhiteBg('flower_petals.jpg', 'transparent_petals.png', 238);
}

run().catch(console.error);
