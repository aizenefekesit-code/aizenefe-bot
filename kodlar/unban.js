const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'unban',
  async run(message) {
    // 1. Yetki Kontrolü
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      const hata = await message.reply('❌ Bu komutu kullanmak için `Üyeleri Yasakla` yetkisine sahip olmalısın!');
      return setTimeout(() => hata.delete().catch(() => {}), 3000);
    }

    if (!message.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
      const botHata = await message.reply('❌ Benim üyelerin yasağını kaldırma yetkim yok!');
      return setTimeout(() => botHata.delete().catch(() => {}), 3000);
    }

    const args = message.content.trim().split(/\s+/).slice(1);

    if (args.length < 1) {
      const kullanimHata = await message.reply('⚠️ Doğru Kullanım: `!unban <Kullanıcı_ID> [sebep]`\nÖrnek: `!unban 123456789012345678 Affedildi`');
      return setTimeout(() => kullanimHata.delete().catch(() => {}), 5000);
    }

    const kullaniciId = args[0];
    const sebep = args.slice(1).join(' ') || 'Sebep belirtilmedi';
    const cezalogKanalId = '1562891418320502804';

    try {
      // 1. Banlı Listesinden Kontrol Etme
      const banListesi = await message.guild.bans.fetch();
      const banlanan = banListesi.get(kullaniciId);

      if (!banlanan) {
        const yokHata = await message.reply('⚠️ Bu ID\'ye sahip bir kullanıcının sunucuda banı bulunmuyor!');
        return setTimeout(() => yokHata.delete().catch(() => {}), 3000);
      }

      // 2. Yasağı Kaldırma İşlemi
      await message.guild.members.unban(kullaniciId, `${message.author.tag}: ${sebep}`);

      // 3. Komut Mesajını Silme
      await message.delete().catch(() => {});

      // 4. CEZALOG KANALINA LOG ATMA
      const logKanal = message.guild.channels.cache.get(cezalogKanalId);
      if (logKanal) {
        const logEmbed = new EmbedBuilder()
          .setColor('#57F287')
          .setTitle('🔓 Unban (Yasak Kaldırma) Raporu')
          .setThumbnail(banlanan.user.displayAvatarURL({ dynamic: true }))
          .addFields(
            { name: '👤 Yasağı Kaldırılan', value: `${banlanan.user.tag}\n(\`<@${banlanan.user.id}>\`)`, inline: true },
            { name: '🛡️ İşlem Yapan Yetkili', value: `${message.author.tag}`, inline: true },
            { name: '📝 Kaldırılma Sebebi', value: `${sebep}`, inline: false }
          )
          .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })
          .setTimestamp();

        logKanal.send({ embeds: [logEmbed] });
      }

    } catch (err) {
      console.error('Unban hatası:', err);
      message.reply('❌ Kullanıcının yasağı kaldırılırken bir hata oluştu! Geçerli bir Kullanıcı ID girdiğinden emin ol.');
    }
  },
};