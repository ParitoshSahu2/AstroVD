const path = require('path');
const sharp = require(path.join(__dirname, '../frontend/node_modules/sharp'));

const inputPath = 'C:\\Users\\parit\\.gemini\\antigravity-ide\\brain\\7da88110-cc54-4023-b190-8ee1093afcaf\\.user_uploaded\\media_1792064999575.png';
const outDir = path.join(__dirname, '../frontend/public/pandits');

async function crop() {
  // 1. Madhuri Dubey photo
  await sharp(inputPath)
    .extract({ left: 234, top: 16, width: 112, height: 112 })
    .resize(320, 320, { fit: 'cover' })
    .toFile(path.join(outDir, 'madhuri_dubey.jpg'));

  // 2. Acharya Sourabh Swami Ji
  await sharp(inputPath)
    .extract({ left: 216, top: 230, width: 120, height: 128 })
    .resize(320, 340, { fit: 'cover' })
    .toFile(path.join(outDir, 'sourabh_swami.jpg'));

  // 3. Pandit Ji (Senior Astrologer)
  await sharp(inputPath)
    .extract({ left: 369, top: 230, width: 120, height: 128 })
    .resize(320, 340, { fit: 'cover' })
    .toFile(path.join(outDir, 'senior_astrologer.jpg'));

  // 4. Pandit Ji (Yagyashala)
  await sharp(inputPath)
    .extract({ left: 522, top: 230, width: 120, height: 128 })
    .resize(320, 340, { fit: 'cover' })
    .toFile(path.join(outDir, 'yagyashala_pandit.jpg'));

  // 5. Pandit Ji (Karamkand)
  await sharp(inputPath)
    .extract({ left: 675, top: 230, width: 120, height: 128 })
    .resize(320, 340, { fit: 'cover' })
    .toFile(path.join(outDir, 'karamkand_pandit.jpg'));

  console.log('Precision cropped all 5 photos');
}

crop().catch(console.error);
