const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'kick',
  async run(message) {
    // 1. Yetki Kontrolü (Komutu yazanın 'Üyeleri At' yetkisi var mı?)
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      const hata = await message.reply('❌ Bu komutu kullanmak için `Üyeleri At` yetkisine sahip olmalısın!');
      return setTimeout(() => hata.delete().catch(() => {}), 3000);
    }

    // 2. Botun Yetki Kontrolü
    if (!message.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
      const botHata = await message.reply('❌ Benim üyeleri sunucudan atma yetkim yok! Lütfen rolüme `Üyeleri At` yetkisi ver.');
      return setTimeout(() => botHata.delete().catch(() => {}), 3000);
    }

    const args = message.content.trim().split(/\s+/).slice(1);

    if (args.length < 1) {
      const kullanimHata = await message.reply('⚠️ Doğru Kullanım: `!kick @kullanıcı [sebep]`\nÖrnek: `!kick @üye Uyarsız Davranış`');
      return setTimeout(() => kullanimHata.delete().catch(() => {}), 5000);
    }

    const hedef = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);

    if (!hedef) {
      const hedefHata = await message.reply('⚠️ Lütfen sunucudan atılacak geçerli bir üye etiketleyin veya ID girin!');
      return setTimeout(() => hedefHata.delete().catch(() => {}), 3000);
    }

    if (hedef.id === message.author.id) {
      const kendiHata = await message.reply('❌ Kendini sunucudan atamazsın!');
      return setTimeout(() => kendiHata.delete().catch(() => {}), 3000);
    }

    if (hedef.kickable === false) {
      const yetkiUstHata = await message.reply('❌ Bu üyenin yetkisi benden veya senden yüksek olduğu için onu atamam!');
      return setTimeout(() => yetkiUstHata.delete().catch(() => {}), 4000);
    }

    const sebep = args.slice(1).join(' ') || 'Sebep belirtilmedi';
    const cezalogKanalId = '1562891418320502804';

    try {
      // 1. ÜYEYE DM'DEN EMBED BİLDİRİMİ GÖNDERME
      const dmEmbed = new EmbedBuilder()
        .setColor('#ED4245')
        .setTitle(`🚪 ${message.guild.name} Sunucusundan Atıldınız!`)
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .addFields(
          { name: '🛡️ İşlem Yapan Yetkili', value: `\`${message.author.tag}\``, inline: true },
          { name: '📝 Atılma Sebebi', value: `\`\`\`${sebep}\`\`\``, inline: false }
        )
        .setFooter({ text: `${message.guild.name} • Güvenlik Sistemi`, iconURL: message.guild.iconURL() })
        .setTimestamp();

      await hedef.send({ embeds: [dmEmbed] }).catch(() => {});

      // 2. SUNUCUDAN ATMA İŞLEMİ
      await hedef.kick(`${message.author.tag}: ${sebep}`);

      // 3. KOMUT MESAJINI SİLME
      await message.delete().catch(() => {});

      // 4. CEZALOG KANALINA ARAYÜZLÜ LOG
      const logKanal = message.guild.channels.cache.get(cezalogKanalId);
      if (logKanal) {
        const logEmbed = new EmbedBuilder()
          .setColor('#ED4245')
          .setTitle('🚪 Kick (Sunucudan Atma) Raporu')
          .setThumbnail(hedef.user.displayAvatarURL({ dynamic: true }))
          .addFields(
            { name: '👤 Atılan Üye', value: `${hedef.user.tag}\n(\`<@${hedef.id}>\`)`, inline: true },
            { name: '🛡️ İşlem Yapan Yetkili', value: `${message.author.tag}`, inline: true },
            { name: '📝 Sebep', value: `${sebep}`, inline: false }
          )
          .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })
          .setTimestamp();

        logKanal.send({ embeds: [logEmbed] });
      }

    } catch (err) {
      console.error('Kick hatası:', err);
      message.reply('❌ Üye atılırken bir hata oluştu!');
    }
  },
};