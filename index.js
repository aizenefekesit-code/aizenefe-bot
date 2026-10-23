require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');

// ==========================================
// RENDER VE UPTIMEROBOT İÇİN WEB SUNUCUSU
// ==========================================
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('aizenefe bot 7/24 aktif ve çalışıyor!');
});

app.listen(port, () => {
  console.log(`🌐 Web sunucusu port dinliyor: ${port}`);
});

// ==========================================
// TICKET MODÜLÜ VE DISCORD BOT KURULUMU
// ==========================================
const ticket = require('./kodlar/ticket');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

// 'kodlar' klasöründeki dosyaları okuyan altyapı
const kodlarPath = path.join(__dirname, 'kodlar');

if (fs.existsSync(kodlarPath)) {
  const dosyalar = fs.readdirSync(kodlarPath).filter(file => file.endsWith('.js'));

  for (const dosya of dosyalar) {
    const dosyaYolu = path.join(kodlarPath, dosya);
    const icerik = require(dosyaYolu);

    // Komut dosyaları için (sa.js, temizle.js vb.)
    if (icerik.name && icerik.run) {
      client.commands.set(icerik.name, icerik);
      console.log(`📜 Komut yüklendi: ${icerik.name}`);
    }

    // Otomatik olaylar için (hosgeldin.js, gulegule.js vb.)
    if (icerik.event && icerik.execute) {
      client.on(icerik.event, (...args) => icerik.execute(...args));
      console.log(`⚡ Sistem yüklendi: ${dosya}`);
    }
  }
}

client.once('ready', () => {
  console.log(`🤖 ${client.user.tag} başarıyla bağlandı!`);
});

// Buton ve Modal etkileşim dinleyicisi (Ticket sistemi için)
client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton() || interaction.isModalSubmit()) {
    try {
      await ticket.interactionHandler(interaction);
    } catch (err) {
      console.error('Etkileşim hatası:', err);
    }
  }
});

// Mesaj dinleyici
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const icerik = message.content.trim();

  // Düz "sa" için özel kontrol (başında ! olmadan çalışır)
  if (icerik.toLowerCase() === 'sa') {
    const saKomut = client.commands.get('sa');
    if (saKomut) return saKomut.run(message);
  }

  // Diğer komutların başında "!" olmak zorundadır
  if (!icerik.startsWith('!')) return;

  const args = icerik.slice(1).split(/\s+/);
  const komutAdi = args.shift().toLowerCase();

  const komut = client.commands.get(komutAdi);
  if (komut) {
    try {
      await komut.run(message);
    } catch (err) {
      console.error('Komut çalıştırma hatası:', err);
    }
  }
});

client.login(process.env.TOKEN);