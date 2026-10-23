const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
  name: 'tkm',
  async run(message) {
    const args = message.content.trim().split(/\s+/).slice(1);
    const rakip = message.mentions.members.first();

    // ----------------------------------------------------
    // 1. MOD: BAŞKA BİR OYUNCUYLA KAPIŞMA (PvP)
    // ----------------------------------------------------
    if (rakip) {
      if (rakip.id === message.author.id) {
        const hata = await message.reply('❌ Kendinle Taş-Kağıt-Makas oynayamazsın!');
        return setTimeout(() => hata.delete().catch(() => {}), 3000);
      }

      if (rakip.user.bot) {
        const hata = await message.reply('❌ Botlara davet gönderemezsin! Botla oynamak için sadece `!tkm` yaz.');
        return setTimeout(() => hata.delete().catch(() => {}), 3000);
      }

      // Davet Kartı
      const davetEmbed = new EmbedBuilder()
        .setColor('#FEE75C')
        .setTitle('⚔️ Taş - Kağıt - Makas Düellosu')
        .setDescription(`Hey ${rakip}! ${message.author} seni **Taş-Kağıt-Makas** düellosuna davet etti!\n\nKabul ediyor musun?`)
        .setFooter({ text: 'Daveti yanıtlamak için 30 saniyen var.', iconURL: message.guild.iconURL() })
        .setTimestamp();

      const kabulBtn = new ButtonBuilder().setCustomId('tkm_kabul').setLabel('✅ Kabul Et').setStyle(ButtonStyle.Success);
      const reddetBtn = new ButtonBuilder().setCustomId('tkm_red').setLabel('❌ Reddet').setStyle(ButtonStyle.Danger);
      const davetRow = new ActionRowBuilder().addComponents(kabulBtn, reddetBtn);

      const davetMesaji = await message.channel.send({ content: `${rakip}`, embeds: [davetEmbed], components: [davetRow] });

      const davetCollector = davetMesaji.createMessageComponentCollector({
        filter: (i) => i.user.id === rakip.id,
        time: 30000,
        max: 1
      });

      davetCollector.on('collect', async (interaction) => {
        if (interaction.customId === 'tkm_red') {
          const redEmbed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('⚔️ Düello Reddedildi')
            .setDescription(`${rakip}, ${message.author} tarafından atılan düelloyu reddetti.`);
          
          return interaction.update({ embeds: [redEmbed], components: [] });
        }

        // Oyun Başlıyor
        let hamleler = {}; // { userId: 'tas' }

        const oyunEmbed = new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle('⚔️ Taş - Kağıt - Makas Kapışması')
          .setDescription(`**${message.author.displayName}** VS **${rakip.displayName}**\n\nİki taraf da aşağıdaki butonlardan gizli hamlesini yapsın!\n\n👤 **${message.author.displayName}:** ${hamleler[message.author.id] ? '✅ Seçti' : '⏳ Bekleniyor...'}\n👤 **${rakip.displayName}:** ${hamleler[rakip.id] ? '✅ Seçti' : '⏳ Bekleniyor...'}`)
          .setFooter({ text: 'Hamle yapmak için 30 saniyeniz var.', iconURL: message.guild.iconURL() });

        const tasBtn = new ButtonBuilder().setCustomId('tas').setLabel('🪨 Taş').setStyle(ButtonStyle.Primary);
        const kagitBtn = new ButtonBuilder().setCustomId('kagit').setLabel('📄 Kağıt').setStyle(ButtonStyle.Primary);
        const makasBtn = new ButtonBuilder().setCustomId('makas').setLabel('✂️ Makas').setStyle(ButtonStyle.Primary);
        const hamleRow = new ActionRowBuilder().addComponents(tasBtn, kagitBtn, makasBtn);

        await interaction.update({ embeds: [oyunEmbed], components: [hamleRow] });

        const oyunCollector = davetMesaji.createMessageComponentCollector({
          filter: (i) => [message.author.id, rakip.id].includes(i.user.id),
          time: 30000
        });

        oyunCollector.on('collect', async (btnInt) => {
          if (hamleler[btnInt.user.id]) {
            return btnInt.reply({ content: '❌ Zaten hamleni yaptın, rakibin seçmesini bekle!', ephemeral: true });
          }

          hamleler[btnInt.user.id] = btnInt.customId;
          await btnInt.reply({ content: `✅ Seçimin alındı: **${btnInt.customId.toUpperCase()}**`, ephemeral: true });

          // İki oyuncu da hamle yaptıysa
          if (Object.keys(hamleler).length === 2) {
            oyunCollector.stop('tamamlandi');

            const p1Hamle = hamleler[message.author.id];
            const p2Hamle = hamleler[rakip.id];
            const ikonlar = { tas: '🪨 Taş', kagit: '📄 Kağıt', makas: '✂️ Makas' };

            let kazananMetni = '';
            let renk = '#57F287';

            if (p1Hamle === p2Hamle) {
              kazananMetni = '🤝 **Berabere Bitti!**';
              renk = '#FEE75C';
            } else if (
              (p1Hamle === 'tas' && p2Hamle === 'makas') ||
              (p1Hamle === 'kagit' && p2Hamle === 'tas') ||
              (p1Hamle === 'makas' && p2Hamle === 'kagit')
            ) {
              kazananMetni = `🎉 **Kazanan:** ${message.author}`;
            } else {
              kazananMetni = `🎉 **Kazanan:** ${rakip}`;
            }

            const sonucEmbed = new EmbedBuilder()
              .setColor(renk)
              .setTitle('🏆 Düello Sonucu')
              .addFields(
                { name: `👤 ${message.author.displayName}`, value: ikonlar[p1Hamle], inline: true },
                { name: `👤 ${rakip.displayName}`, value: ikonlar[p2Hamle], inline: true },
                { name: '📣 Sonuç', value: kazananMetni, inline: false }
              )
              .setTimestamp();

            await davetMesaji.edit({ embeds: [sonucEmbed], components: [] });
          } else {
            // Bir kişi seçti, kartı güncelle
            const guncelEmbed = new EmbedBuilder()
              .setColor('#5865F2')
              .setTitle('⚔️ Taş - Kağıt - Makas Kapışması')
              .setDescription(`**${message.author.displayName}** VS **${rakip.displayName}**\n\n👤 **${message.author.displayName}:** ${hamleler[message.author.id] ? '✅ Seçti' : '⏳ Bekleniyor...'}\n👤 **${rakip.displayName}:** ${hamleler[rakip.id] ? '✅ Seçti' : '⏳ Bekleniyor...'}`);

            await davetMesaji.edit({ embeds: [guncelEmbed] });
          }
        });

        oyunCollector.on('end', (c, reason) => {
          if (reason !== 'tamamlandi') {
            const zamanAşımı = new EmbedBuilder().setColor('#ED4245').setTitle('⏰ Süre Doldu').setDescription('Oyunculardan biri zamanında hamle yapmadığı için kapışma iptal edildi.');
            davetMesaji.edit({ embeds: [zamanAşımı], components: [] }).catch(() => {});
          }
        });
      });

      return;
    }

    // ----------------------------------------------------
    // 2. MOD: BOTA KARŞI OYNAMA (PvE)
    // ----------------------------------------------------
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎮 Taş - Kağıt - Makas (Bot ile)')
      .setDescription('Aşağıdaki butonlardan birini seçerek hamleni yap!')
      .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    const tas = new ButtonBuilder().setCustomId('tkm_tas').setLabel('🪨 Taş').setStyle(ButtonStyle.Primary);
    const kagit = new ButtonBuilder().setCustomId('tkm_kagit').setLabel('📄 Kağıt').setStyle(ButtonStyle.Primary);
    const makas = new ButtonBuilder().setCustomId('tkm_makas').setLabel('✂️ Makas').setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder().addComponents(tas, kagit, makas);

    const oyunMesaji = await message.channel.send({ embeds: [embed], components: [row] });

    const collector = oyunMesaji.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 30000,
      max: 1
    });

    collector.on('collect', async (interaction) => {
      const secenekler = ['tas', 'kagit', 'makas'];
      const botSecimi = secenekler[Math.floor(Math.random() * secenekler.length)];
      const oyuncuSecimi = interaction.customId.replace('tkm_', '');
      const ikonlar = { tas: '🪨 Taş', kagit: '📄 Kağıt', makas: '✂️ Makas' };

      let sonuc = '';
      let renk = '#57F287';

      if (oyuncuSecimi === botSecimi) {
        sonuc = '🤝 **Berabere Bitti!**';
        renk = '#FEE75C';
      } else if (
        (oyuncuSecimi === 'tas' && botSecimi === 'makas') ||
        (oyuncuSecimi === 'kagit' && botSecimi === 'tas') ||
        (oyuncuSecimi === 'makas' && botSecimi === 'kagit')
      ) {
        sonuc = '🎉 **Tebrikler, Sen Kazandın!**';
      } else {
        sonuc = '🤖 **Bot Kazandı!**';
        renk = '#ED4245';
      }

      const sonucEmbed = new EmbedBuilder()
        .setColor(renk)
        .setTitle('🎮 Taş - Kağıt - Makas Sonucu')
        .addFields(
          { name: '👤 Senin Seçimin', value: ikonlar[oyuncuSecimi], inline: true },
          { name: '🤖 Botun Seçimi', value: ikonlar[botSecimi], inline: true },
          { name: '🏆 Sonuç', value: sonuc, inline: false }
        )
        .setTimestamp();

      await interaction.update({ embeds: [sonucEmbed], components: [] });
    });
  },
};