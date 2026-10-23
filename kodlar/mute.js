const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

function turkceSureHesapla(metin) {
  let toplamMs = 0;
  const regex = /(\d+)\s*(yıl|yil|y|ay|hafta|h|gün|gun|g|saniye|sn|s|dakika|dk|m|saat|sa)/gi;
  let eslesme;

  while ((eslesme = regex.exec(metin)) !== null) {
    const sayi = parseInt(eslesme[1]);
    const birim = eslesme[2].toLowerCase();

    if (['yıl', 'yil', 'y'].includes(birim)) toplamMs += sayi * 365 * 24 * 60 * 60 * 1000;
    else if (birim === 'ay') toplamMs += sayi * 30 * 24 * 60 * 60 * 1000;
    else if (['hafta', 'h'].includes(birim)) toplamMs += sayi * 7 * 24 * 60 * 60 * 1000;
    else if (['gün', 'gun', 'g'].includes(birim)) toplamMs += sayi * 24 * 60 * 60 * 1000;
    else if (['saniye', 'sn', 's'].includes(birim)) toplamMs += sayi * 1000;
    else if (['dakika', 'dk', 'm'].includes(birim)) toplamMs += sayi * 60 * 1000;
    else if (['saat', 'sa'].includes(birim)) toplamMs += sayi * 60 * 60 * 1000;
  }

  return toplamMs;
}

module.exports = {
  name: 'mute',
  async run(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
      const hata = await message.reply('❌ Bu komutu kullanmak için `Üyeleri Sustur` yetkisine sahip olmalısın!');
      return setTimeout(() => hata.delete().catch(() => {}), 3000);
    }

    if (!message.guild.members.me.permissions.has(PermissionFlagsBits.MuteMembers)) {
      const botHata = await message.reply('❌ Benim üyeleri sustained yetkim yok!');
      return setTimeout(() => botHata.delete().catch(() => {}), 3000);
    }

    const args = message.content.trim().split(/\s+/).slice(1);

    if (args.length < 2) {
      const kullanimHata = await message.reply('⚠️ Doğru Kullanım: `!mute @kullanıcı <süre> [sebep]`\nÖrnek: `!mute @üye 10dk Küfür`');
      return setTimeout(() => kullanimHata.delete().catch(() => {}), 5000);
    }

    const hedef = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if (!hedef) {
      const hedefHata = await message.reply('⚠️ Lütfen susturulacak geçerli bir üye etiketleyin!');
      return setTimeout(() => hedefHata.delete().catch(() => {}), 3000);
    }

    if (hedef.id === message.author.id) {
      const kendiHata = await message.reply('❌ Kendini sustained!');
      return setTimeout(() => kendiHata.delete().catch(() => {}), 3000);
    }

    if (!hedef.moderatable) {
      const yetkiUstHata = await message.reply('❌ Bu üyenin yetkisi benden yüksek olduğu için onu susturamam!');
      return setTimeout(() => yetkiUstHata.delete().catch(() => {}), 4000);
    }

    const sureMetni = args[1];
    const zamanMs = turkceSureHesapla(sureMetni);

    if (zamanMs <= 0 || zamanMs > 28 * 24 * 60 * 60 * 1000) {
      const sureHata = await message.reply('⚠️ Geçersiz süre! En fazla 28 gün belirtebilirsin (Örn: `10dk`, `2saat`).');
      return setTimeout(() => sureHata.delete().catch(() => {}), 4000);
    }

    const sebep = args.slice(2).join(' ') || 'Sebep belirtilmedi';
    const cezaliRolId = '1562891312427044874';
    const cezalogKanalId = '1562891418320502804';

    try {
      await hedef.timeout(zamanMs, sebep);
      await hedef.roles.add(cezaliRolId).catch(() => {});
      await message.delete().catch(() => {});

      // 1. ÜYEYE DM'DEN ŞIK EMBED BİLDİRİMİ GÖNDERME
      const dmEmbed = new EmbedBuilder()
        .setColor('#ED4245')
        .setTitle(`🔇 ${message.guild.name} Sunucusunda Susturuldun!`)
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .addFields(
          { name: '⏱️ Susturulma Süresi', value: `\`${sureMetni}\``, inline: true },
          { name: '🛡️ İşlem Yapan Yetkili', value: `\`${message.author.tag}\``, inline: true },
          { name: '📝 Susturulma Sebebi', value: `\`\`\`${sebep}\`\`\``, inline: false }
        )
        .setFooter({ text: `${message.guild.name} • Güvenlik Sistemi`, iconURL: message.guild.iconURL() })
        .setTimestamp();

      await hedef.send({ embeds: [dmEmbed] }).catch(() => {});

      // 2. CEZALOG KANALINA ARAYÜZLÜ LOG
      const logKanal = message.guild.channels.cache.get(cezalogKanalId);
      if (logKanal) {
        const logEmbed = new EmbedBuilder()
          .setColor('#ED4245')
          .setTitle('🔇 Manuel Mute (Susturma) Raporu')
          .setThumbnail(hedef.user.displayAvatarURL({ dynamic: true }))
          .addFields(
            { name: '👤 Susturulan Üye', value: `${hedef.user.tag}\n(\`<@${hedef.id}>\`)`, inline: true },
            { name: '🛡️ İşlem Yapan Yetkili', value: `${message.author.tag}`, inline: true },
            { name: '⏱️ Süre', value: `\`${sureMetni}\``, inline: true },
            { name: '📝 Sebep', value: `${sebep}`, inline: false }
          )
          .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })
          .setTimestamp();

        logKanal.send({ embeds: [logEmbed] });
      }

    } catch (err) {
      console.error('Mute hatası:', err);
    }
  },
};