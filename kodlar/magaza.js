const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { profilGetir, profilGuncelle, ESYALAR } = require('./zindanYardimci');

module.exports = {
  name: 'mağaza',
  async run(message) {
    const profil = profilGetir(message.author.id);

    const anaEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🛒 Lunexia Market')
      .setDescription(`Hoş geldin Maceracı ${message.author}!\nSatın almak istediğin kategoriyi aşağıdaki butonlardan seç.\n\n💰 **Mevcut Altının:** \`${profil.altin} Altın\``)
      .addFields(
        { name: '⚔️ Silahlar & Asalar', value: 'Saldırı ve büyü gücünü arttırır.', inline: true },
        { name: '🛡️ Zırhlar', value: 'Savunma ve maksimum can sağlar.', inline: true },
        { name: '💍 Yüzükler & Tılsımlar', value: 'Kritik vuruş ve ekstra statlar verir.', inline: true },
        { name: '🧪 İksirler', value: 'Zindanda canını yeniler.', inline: true }
      )
      .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    const silahKatBtn = new ButtonBuilder().setCustomId('kat_silah').setLabel('⚔️ Silahlar').setStyle(ButtonStyle.Primary);
    const zirhKatBtn = new ButtonBuilder().setCustomId('kat_zirh').setLabel('🛡️ Zırhlar').setStyle(ButtonStyle.Primary);
    const yuzukKatBtn = new ButtonBuilder().setCustomId('kat_yuzuk').setLabel('💍 Yüzükler').setStyle(ButtonStyle.Primary);
    const iksirKatBtn = new ButtonBuilder().setCustomId('kat_iksir').setLabel('🧪 İksirler').setStyle(ButtonStyle.Success);

    const katRow = new ActionRowBuilder().addComponents(silahKatBtn, zirhKatBtn, yuzukKatBtn, iksirKatBtn);

    const magazaMesaji = await message.channel.send({ embeds: [anaEmbed], components: [katRow] });

    const collector = magazaMesaji.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 90000
    });

    collector.on('collect', async (interaction) => {
      const guncelProfil = profilGetir(message.author.id);

      // KATEGORİ SEÇİMLERİ
      if (interaction.customId === 'kat_silah') {
        const embed = new EmbedBuilder().setColor('#5865F2').setTitle('⚔️ Silah & Asa Mağazası').setDescription(`💰 Altının: \`${guncelProfil.altin}\``);
        const row1 = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('al_tahta_kilic').setLabel('🗡️ Tahta Kılıç (100g)').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('al_demir_kilic').setLabel('⚔️ Demir Kılıç (350g)').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('al_cirak_asasi').setLabel('🪄 Çırak Asası (500g)').setStyle(ButtonStyle.Secondary)
        );
        const row2 = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('al_ejder_kilici').setLabel('🗡️ Ejder Kılıcı (1200g)').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId('al_karanlik_asa').setLabel('🔮 Karanlık Asa (1800g)').setStyle(ButtonStyle.Danger)
        );
        return interaction.update({ embeds: [embed], components: [row1, row2] });
      }

      if (interaction.customId === 'kat_zirh') {
        const embed = new EmbedBuilder().setColor('#5865F2').setTitle('🛡️ Zırh Mağazası').setDescription(`💰 Altının: \`${guncelProfil.altin}\``);
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('al_deri_zirh').setLabel('🛡️ Deri Zırh (120g)').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('al_sovalye_zirh').setLabel('🛡️ Şövalye Zırhı (400g)').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('al_ejder_zirh').setLabel('🛡️ Ejder Zırhı (1300g)').setStyle(ButtonStyle.Danger)
        );
        return interaction.update({ embeds: [embed], components: [row] });
      }

      if (interaction.customId === 'kat_yuzuk') {
        const embed = new EmbedBuilder().setColor('#5865F2').setTitle('💍 Yüzük & Tılsım Mağazası').setDescription(`💰 Altının: \`${guncelProfil.altin}\``);
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('al_yasam_yuzugu').setLabel('💍 Yaşam Yüzüğü (300g)').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('al_koruma_tilsimi').setLabel('📿 Koruma Tılsımı (450g)').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('al_anka_yuzugu').setLabel('💍 Anka Yüzüğü (1000g)').setStyle(ButtonStyle.Danger)
        );
        return interaction.update({ embeds: [embed], components: [row] });
      }

      if (interaction.customId === 'kat_iksir') {
        const embed = new EmbedBuilder().setColor('#57F287').setTitle('🧪 İksir Mağazası').setDescription(`💰 Altının: \`${guncelProfil.altin}\``);
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('al_iksir').setLabel('🧪 Can İksiri (+50 HP / 50g)').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId('al_buyuk_iksir').setLabel('🧪 Büyük İksir (+120 HP / 110g)').setStyle(ButtonStyle.Success)
        );
        return interaction.update({ embeds: [embed], components: [row] });
      }

      // SATIN ALMA İŞLEMLERİ (al_ ile başlayan butonlar)
      if (interaction.customId.startsWith('al_')) {
        const esyaKey = interaction.customId.replace('al_', '');
        const esya = ESYALAR[esyaKey];

        if (guncelProfil.altin < esya.fiyat) {
          return interaction.reply({ content: `❌ Yetersiz Altın! Bu eşya için **${esya.fiyat - guncelProfil.altin} Altın** eksik.`, ephemeral: true });
        }

        guncelProfil.altin -= esya.fiyat;

        if (esya.tur === 'silah') guncelProfil.silah = esyaKey;
        else if (esya.tur === 'zirh') guncelProfil.zirh = esyaKey;
        else if (esya.tur === 'yuzuk') guncelProfil.yuzuk = esyaKey;
        else if (esyaKey === 'iksir') guncelProfil.iksir += 1;
        else if (esyaKey === 'buyuk_iksir') guncelProfil.buyukIksir = (guncelProfil.buyukIksir || 0) + 1;

        profilGuncelle(message.author.id, guncelProfil);

        await interaction.reply({ content: `🎉 **${esya.ad}** satın alındı! Kalan Altın: **${guncelProfil.altin}**`, ephemeral: true });
      }
    });
  }
};