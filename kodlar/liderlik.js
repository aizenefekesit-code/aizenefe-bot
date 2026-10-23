const { EmbedBuilder } = require('discord.js');
const { okuVeri } = require('./zindanYardimci');

module.exports = {
  name: 'liderlik',
  async run(message) {
    const veri = okuVeri();
    const oyuncuListesi = Object.keys(veri).map(id => ({ id, ...veri[id] }));

    if (oyuncuListesi.length === 0) {
      return message.reply('❌ Henüz hiç kimse zindana girmedi veya macera başlatmadı!');
    }

    oyuncuListesi.sort((a, b) => b.seviye !== a.seviye ? b.seviye - a.seviye : b.xp - a.xp);

    const ilkBes = oyuncuListesi.slice(0, 10);
    let aciklama = '';
    const madalyalar = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

    for (let i = 0; i < ilkBes.length; i++) {
      const p = ilkBes[i];
      const uye = await message.guild.members.fetch(p.id).catch(() => null);
      const isim = uye ? uye.displayName : 'Bilinmeyen Savaşçı';

      aciklama += `${madalyalar[i]} **${isim}** — Seviye: \`${p.seviye}\` | XP: \`${p.xp}\` | Altın: \`${p.altin}\` 💰\n`;
    }

    const embed = new EmbedBuilder()
      .setColor('#FEE75C')
      .setTitle('🏆 Liderlik Tablosu')
      .setDescription(aciklama)
      .setFooter({ text: `${message.guild.name} • En Güçlü Savaşçılar`, iconURL: message.guild.iconURL() })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};