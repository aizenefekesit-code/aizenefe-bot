const { 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  PermissionFlagsBits 
} = require('discord.js');

// Sıralaması Düzeltilmiş Türkçe Süre Hesaplayıcı
function turkceSureHesapla(metin) {
  let toplamMs = 0;
  
  // ÖNEMLİ: Uzun kelimeleri (saniye, dakika, saat) kısa harflerden (s, sa, dk) ÖNCE aratıyoruz!
  const regex = /(\d+)\s*(yıl|yil|y|ay|hafta|h|gün|gun|g|saniye|sn|s|dakika|dk|m|saat|sa)/gi;
  let eslesme;

  while ((eslesme = regex.exec(metin)) !== null) {
    const sayi = parseInt(eslesme[1]);
    const birim = eslesme[2].toLowerCase();

    if (['yıl', 'yil', 'y'].includes(birim)) toplamMs += sayi * 365 * 24 * 60 * 60 * 1000;
    else if (birim === 'ay') toplamMs += sayi * 30 * 24 * 60 * 60 * 1000;
    else if (['hafta', 'h'].includes(birim)) toplamMs += sayi * 7 * 24 * 60 * 60 * 1000;
    else if (['gün', 'gun', 'g'].includes(birim)) toplamMs += sayi * 24 * 60 * 60 * 1000;
    else if (['saniye', 'sn', 's'].includes(birim)) toplamMs += sayi * 1000; // Saniye önceliği verildi
    else if (['dakika', 'dk', 'm'].includes(birim)) toplamMs += sayi * 60 * 1000;
    else if (['saat', 'sa'].includes(birim)) toplamMs += sayi * 60 * 60 * 1000;
  }

  return toplamMs;
}

module.exports = {
  name: 'çekiliş',
  async run(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      const hata = await message.reply('❌ Bu komutu kullanmak için `Sunucuyu Yönet` yetkisine sahip olmalısın!');
      return setTimeout(() => hata.delete().catch(() => {}), 3000);
    }

    const icerik = message.content.trim().slice(1).trim();
    const args = icerik.split(/\s+/).slice(1);

    if (args.length < 3) {
      const kullanımHata = await message.reply('⚠️ Doğru Kullanım: `!çekiliş <süre> <kazanan_sayısı> <ödül>`');
      return setTimeout(() => kullanımHata.delete().catch(() => {}), 6000);
    }

    let kazananIndex = -1;
    for (let i = 0; i < args.length; i++) {
      if (!isNaN(parseInt(args[i])) && !args[i].match(/(yıl|yil|y|ay|hafta|h|gün|gun|g|saat|sa|dakika|dk|m|saniye|sn|s)/i)) {
        kazananIndex = i;
        break;
      }
    }

    if (kazananIndex === -1 || kazananIndex === 0) {
      const hata = await message.reply('⚠️ Lütfen süreden sonra geçerli bir kazanan sayısı belirtin!');
      return setTimeout(() => hata.delete().catch(() => {}), 4000);
    }

    const sureMetni = args.slice(0, kazananIndex).join(' ');
    const kazananSayisi = parseInt(args[kazananIndex]);
    const odul = args.slice(kazananIndex + 1).join(' ');

    if (!odul) {
      const odulHata = await message.reply('⚠️ Lütfen çekiliş ödülünü belirtin!');
      return setTimeout(() => odulHata.delete().catch(() => {}), 3000);
    }

    const zamanMs = turkceSureHesapla(sureMetni);

    if (zamanMs <= 0) {
      const birimHata = await message.reply('⚠️ Geçersiz süre!');
      return setTimeout(() => birimHata.delete().catch(() => {}), 4000);
    }

    await message.delete().catch(() => {});

    const bitisZamani = Math.floor((Date.now() + zamanMs) / 1000);
    const katilanlar = new Set();

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`🎉 ÇEKİLİŞ: ${odul}`)
      .setDescription(`Katılmak için aşağıdaki **Katıl** butonuna tıklayın!\n\n` +
                      `🎁 **Ödül:** ${odul}\n` +
                      `👑 **Kazanan Sayısı:** ${kazananSayisi}\n` +
                      `👤 **Katılan Sayısı:** 0\n` +
                      `⏳ **Bitiş:** <t:${bitisZamani}:R> (<t:${bitisZamani}:f>)`)
      .setFooter({ text: `Başlatan: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    const buton = new ButtonBuilder()
      .setCustomId('cekilis_katil')
      .setLabel('🎉 Katıl')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(buton);

    const cekilisMesaji = await message.channel.send({ embeds: [embed], components: [row] });

    const collector = cekilisMesaji.createMessageComponentCollector({ time: zamanMs });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'cekilis_katil') {
        if (katilanlar.has(interaction.user.id)) {
          katilanlar.delete(interaction.user.id);
          await interaction.reply({ content: '❌ Çekilişten ayrıldınız.', ephemeral: true });
        } else {
          katilanlar.add(interaction.user.id);
          await interaction.reply({ content: '✅ Çekilişe başarıyla katıldınız!', ephemeral: true });
        }

        const guncelEmbed = EmbedBuilder.from(embed).setDescription(
          `Katılmak için aşağıdaki **Katıl** butonuna tıklayın!\n\n` +
          `🎁 **Ödül:** ${odul}\n` +
          `👑 **Kazanan Sayısı:** ${kazananSayisi}\n` +
          `👤 **Katılan Sayısı:** ${katilanlar.size}\n` +
          `⏳ **Bitiş:** <t:${bitisZamani}:R> (<t:${bitisZamani}:f>)`
        );

        await cekilisMesaji.edit({ embeds: [guncelEmbed] });
      }
    });

    collector.on('end', async () => {
      const kilitliButon = new ButtonBuilder()
        .setCustomId('cekilis_bitti')
        .setLabel('🎉 Çekiliş Sona Erdi')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

      const kilitliRow = new ActionRowBuilder().addComponents(kilitliButon);
      const katilanDizi = Array.from(katilanlar);

      if (katilanDizi.length === 0) {
        const bittiEmbed = EmbedBuilder.from(embed)
          .setColor('#ED4245')
          .setDescription(`❌ Çekiliş sona erdi ancak yeterli katılım olmadığı için kazanan seçilemedi.\n\n🎁 **Ödül:** ${odul}`);

        await cekilisMesaji.edit({ embeds: [bittiEmbed], components: [kilitliRow] });
        return;
      }

      const kazananlar = [];
      const secilecekSayi = Math.min(kazananSayisi, katilanDizi.length);

      while (kazananlar.length < secilecekSayi) {
        const rastgeleIndex = Math.floor(Math.random() * katilanDizi.length);
        const secilen = katilanDizi.splice(rastgeleIndex, 1)[0];
        kazananlar.push(`<@${secilen}>`);
      }

      const bitisEmbed = EmbedBuilder.from(embed)
        .setColor('#57F287')
        .setDescription(`🎉 **ÇEKİLİŞ SONUÇLANDI!**\n\n` +
                        `🎁 **Ödül:** ${odul}\n` +
                        `🏆 **Kazanan(lar):** ${kazananlar.join(', ')}\n` +
                        `👤 **Toplam Katılan:** ${katilanlar.size}`);

      await cekilisMesaji.edit({ embeds: [bitisEmbed], components: [kilitliRow] });
      message.channel.send(`🎉 Tebrikler ${kazananlar.join(', ')}! **${odul}** kazandınız!`);
    });
  },
};