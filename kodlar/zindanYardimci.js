const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/rpgData.json');

function okuVeri() {
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    fs.writeFileSync(dataPath, '{}');
  }
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function yazVeri(veri) {
  fs.writeFileSync(dataPath, JSON.stringify(veri, null, 2));
}

function profilGetir(userId) {
  const veri = okuVeri();
  if (!veri[userId]) {
    veri[userId] = {
      seviye: 1,
      xp: 0,
      altin: 100,
      hp: 100,
      maxHp: 100,
      iksir: 1,
      buyukIksir: 0,
      silah: null,
      zirh: null,
      yuzuk: null,
      sonGunluk: 0
    };
    yazVeri(veri);
  }
  return veri[userId];
}

function profilGuncelle(userId, yeniVeri) {
  const veri = okuVeri();
  veri[userId] = { ...veri[userId], ...yeniVeri };
  yazVeri(veri);
}

const ESYALAR = {
  // SILAHLAR
  tahta_kilic: { ad: '🗡️ Tahta Kılıç', tur: 'silah', fiyat: 100, atk: 5, ap: 0, kritik: 0 },
  demir_kilic: { ad: '⚔️ Demir Kılıç', tur: 'silah', fiyat: 350, atk: 15, ap: 0, kritik: 0 },
  cirak_asasi: { ad: '🪄 Çırak Büyü Asası', tur: 'silah', fiyat: 500, atk: 0, ap: 20, kritik: 5 },
  ejder_kilici: { ad: '🗡️ Ejderha Katili Kılıç', tur: 'silah', fiyat: 1200, atk: 40, ap: 0, kritik: 0 },
  karanlik_asa: { ad: '🔮 Karanlık Lord Asası', tur: 'silah', fiyat: 1800, atk: 0, ap: 50, kritik: 15 },

  // ZIRHLAR
  deri_zirh: { ad: '🛡️ Deri Zırh', tur: 'zirh', fiyat: 120, def: 5, hpBonus: 20 },
  sovalye_zirh: { ad: '🛡️ Şövalye Zırhı', tur: 'zirh', fiyat: 400, def: 15, hpBonus: 50 },
  ejder_zirh: { ad: '🛡️ Efsanevi Ejder Zırhı', tur: 'zirh', fiyat: 1300, def: 35, hpBonus: 120 },

  // YÜZÜKLER
  yasam_yuzugu: { ad: '💍 Yaşam Yüzüğü', tur: 'yuzuk', fiyat: 300, def: 0, hpBonus: 30, kritik: 0 },
  koruma_tilsimi: { ad: '📿 Koruma Tılsımı', tur: 'yuzuk', fiyat: 450, def: 10, hpBonus: 0, kritik: 0 },
  anka_yuzugu: { ad: '💍 Anka Kuşu Yüzüğü', tur: 'yuzuk', fiyat: 1000, def: 0, hpBonus: 60, kritik: 10 },

  // TÜKETİM
  iksir: { ad: '🧪 Can İksiri (+50 HP)', tur: 'tuketim', fiyat: 50, iyilestirme: 50 },
  buyuk_iksir: { ad: '🧪 Büyük İksir (+120 HP)', tur: 'tuketim', fiyat: 110, iyilestirme: 120 }
};

// 12 Farklı Seviye Seviye Yaratık Havuzu
const CANAVARLAR = [
  // Kolay / Başlangıç (Seviye 1-3)
  { minSeviye: 1, ad: '🦇 Mağara Yarasası', hp: 35, atk: 6, xp: 20, altin: 25, renk: '#3BA55D' },
  { minSeviye: 1, ad: '👺 Karakaya Goblin\'i', hp: 50, atk: 9, xp: 35, altin: 45, renk: '#3BA55D' },
  { minSeviye: 2, ad: '🕷️ Zehirli Örümcek', hp: 65, atk: 12, xp: 45, altin: 60, renk: '#3BA55D' },

  // Orta Seviye (Seviye 4-6)
  { minSeviye: 4, ad: '🐺 Gölge Kurt', hp: 90, atk: 16, xp: 65, altin: 85, renk: '#FEE75C' },
  { minSeviye: 5, ad: '💀 Lanetli İskelet', hp: 120, atk: 22, xp: 90, altin: 120, renk: '#FEE75C' },
  { minSeviye: 6, ad: '🧟 Zombi Savaşçı', hp: 150, atk: 28, xp: 120, altin: 150, renk: '#FEE75C' },

  // Zor Seviye (Seviye 7-9)
  { minSeviye: 7, ad: '👹 Savaşçı Ork', hp: 200, atk: 35, xp: 160, altin: 200, renk: '#EB459E' },
  { minSeviye: 8, ad: '🗿 Kaya Golemi', hp: 260, atk: 42, xp: 210, altin: 260, renk: '#EB459E' },
  { minSeviye: 9, ad: '🔥 Ateş Elementali', hp: 320, atk: 50, xp: 270, altin: 330, renk: '#EB459E' },

  // Efsanevi / Boss (Seviye 10+)
  { minSeviye: 10, ad: '❄️ Buz Devi (BOSS)', hp: 420, atk: 60, xp: 350, altin: 450, renk: '#ED4245' },
  { minSeviye: 12, ad: '🐉 Lav Ejderhası (BOSS)', hp: 550, atk: 75, xp: 500, altin: 650, renk: '#ED4245' },
  { minSeviye: 15, ad: '👑 Kadim İblis Kralı (EFSUK BOSS)', hp: 800, atk: 95, xp: 800, altin: 1000, renk: '#9B59B6' }
];

module.exports = { okuVeri, yazVeri, profilGetir, profilGuncelle, ESYALAR, CANAVARLAR };