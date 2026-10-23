const { EmbedBuilder } = require('discord.js');
const { profilGetir, ESYALAR } = require('./zindanYardimci');

module.exports = {
  name: 'envanter',
  async run(message) {
    const hedef = message.mentions.users.first() || message.author;
    const profil = profilGetir(hedef.id);

    // Eşya Nesnelerini Çekme
    const silah = profil.silah ? ESYALAR[profil.silah] : null;
    const zirh = profil.zirh ? ESYALAR[profil.zirh] : null;
    const yuzuk = profil.yuzuk ? ESYALAR[profil.yuzuk] : null;

    // Stat Hesaplamaları
    let atk = 10 + (profil.seviye * 2);
    let ap = 0;
    let def = 2;
    let bonusHp = 0;
    let kritik = 10;

    if (silah) {
      atk += silah.atk || 0;
      ap += silah.ap || 0;
      kritik += silah.kritik || 0;
    }

    if (zirh) {
      def += zirh.def || 0;
      bonusHp += zirh.hpBonus || 0;
    }

    if (yuzuk) {
      def += yuzuk.def || 0;
      bonusHp += yuzuk.hpBonus || 0;
      kritik += yuzuk.kritik || 0;
    }

    const maxHp = 100 + (profil.seviye * 15) + bonusHp;

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`🎒 ${hedef.username} — Envanter ve Profil`)
      .setThumbnail(hedef.displayAvatarURL({ dynamic: true }))
      .addFields(
        {
          name: '📊 Maceracı İstatistikleri',
          value:
            `⭐ **Seviye:** \`${profil.seviye}\`\n` +
            `✨ **XP:** \`${profil.xp}/${profil.seviye * 100}\`\n` +
            `💰 **Altın:** \`${profil.altin}\` G\n` +
            `❤️ **Maksimum Can:** \`${maxHp} HP\``,
          inline: true
        },
        {
          name: '⚔️ Savaş Değerleri',
          value:
            `🗡️ **Fiziksel Hasar (ATK):** \`${atk}\`\n` +
            `🔮 **Büyü Gücü (AP):** \`${ap}\`\n` +
            `🛡️ **Toplam Savunma (DEF):** \`${def}\`\n` +
            `💥 **Kritik Vuruş:** \`%${kritik}\``,
          inline: true
        },
        {
          name: '🛡️ Kuşanılan Ekipmanlar',
          value:
            `🗡️ **Silah/Asa:** ${silah ? silah.ad : '`Yok`'}\n` +
            `🛡️ **Zırh:** ${zirh ? zirh.ad : '`Yok`'}\n` +
            `💍 **Yüzük/Tılsım:** ${yuzuk ? yuzuk.ad : '`Yok`'}`,
          inline: false
        },
        {
          name: '🧪 Çanta ve Tüketim',
          value:
            `🧪 **Can İksiri (+50 HP):** \`${profil.iksir}\` Adet\n` +
            `🧪 **Büyük İksir (+120 HP):** \`${profil.buyukIksir || 0}\` Adet`,
          inline: false
        }
      )
      .setFooter({ text: `${message.guild.name} • Envanter Sistemi`, iconURL: message.guild.iconURL() })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};