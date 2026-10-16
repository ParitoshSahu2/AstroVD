const path = require('path');
const sharp = require(path.join(__dirname, '../frontend/node_modules/sharp'));

const inputPath = 'C:\\Users\\parit\\.gemini\\antigravity-ide\\brain\\7da88110-cc54-4023-b190-8ee1093afcaf\\.user_uploaded\\media_1792065551975.jpg';
const outDir = path.join(__dirname, '../frontend/public/products');

async function crop() {
  const fs = require('fs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Extract base photo of tiger eye bracelet (inside the left card frame)
  await sharp(inputPath)
    .extract({ left: 35, top: 72, width: 440, height: 574 })
    .resize(600, 780, { fit: 'cover' })
    .toFile(path.join(outDir, 'tiger_eye_bracelet.jpg'));

  console.log('Successfully cropped tiger_eye_bracelet.jpg');
}

crop().catch(console.error);
