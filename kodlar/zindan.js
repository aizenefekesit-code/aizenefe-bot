const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { profilGetir, profilGuncelle, ESYALAR, CANAVARLAR } = require('./zindanYardimci');

module.exports = {
  name: 'zindan',
  async run(message) {
    const profil = profilGetir(message.author.id);

    // Stat Hesaplamaları
    let atk = 10 + (profil.seviye * 2);
    let ap = 0;
    let def = 2;
    let bonusHp = 0;
    let kritikSans = 10;

    if (profil.silah) {
      const s = ESYALAR[profil.silah];
      atk += s.atk || 0;
      ap += s.ap || 0;
      kritikSans += s.kritik || 0;
    }
    if (profil.zirh) {
      const z = ESYALAR[profil.zirh];
      def += z.def || 0;
      bonusHp += z.hpBonus || 0;
    }
    if (profil.yuzuk) {
      const y = ESYALAR[profil.yuzuk];
      def += y.def || 0;
      bonusHp += y.hpBonus || 0;
      kritikSans += y.kritik || 0;
    }

    const oyuncuMaxHp = 100 + (profil.seviye * 15) + bonusHp;
    let oyuncuHp = oyuncuMaxHp;

    // DINAMIK CANAVAR SEÇİMİ: Oyuncunun seviyesine uygun canavarları filtrele
    const uygunCanavarlar = CANAVARLAR.filter(c => c.minSeviye <= profil.seviye);
    const secilenCanavarTipi = uygunCanavarlar[Math.floor(Math.random() * uygunCanavarlar.length)];

    // Canavarın can ve saldırısını oyuncunun statlarına göre ölçekle
    const canavar = {
      ad: secilenCanavarTipi.ad,
      hp: secilenCanavarTipi.hp + Math.floor(profil.seviye * 8),
      atk: secilenCanavarTipi.atk + Math.floor(profil.seviye * 1.5),
      xp: secilenCanavarTipi.xp,
      altin: secilenCanavarTipi.altin,
      renk: secilenCanavarTipi.renk
    };

    const canavarMaxHp = canavar.hp;

    const embed = new EmbedBuilder()
      .setColor(canavar.renk)
      .setTitle(`⚔️ Zindana Girildi: ${canavar.ad}`)
      .setDescription(`Karşına senin seviyene denk bir **${canavar.ad}** çıktı!\n\n❤️ **Senin Canın:** \`${oyuncuHp}/${oyuncuMaxHp}\`\n🩸 **Canavar Canı:** \`${canavar.hp}/${canavarMaxHp}\``)
      .setFooter({ text: `${message.author.displayName} • Zindan Savaşı`, iconURL: message.author.displayAvatarURL() });

    const saldirBtn = new ButtonBuilder().setCustomId('z_saldir').setLabel('⚔️ Saldır').setStyle(ButtonStyle.Danger);
    const savunBtn = new ButtonBuilder().setCustomId('z_savun').setLabel('🛡️ Savun').setStyle(ButtonStyle.Primary);
    const iksirBtn = new ButtonBuilder().setCustomId('z_iksir').setLabel(`🧪 İksir (${profil.iksir})`).setStyle(ButtonStyle.Success);
    const kacBtn = new ButtonBuilder().setCustomId('z_kac').setLabel('🏃 Kaç').setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(saldirBtn, savunBtn, iksirBtn, kacBtn);
    const zindanMesaji = await message.channel.send({ embeds: [embed], components: [row] });

    const collector = zindanMesaji.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 45000
    });

    let savunmaAktif = false;

    collector.on('collect', async (i) => {
      let hamleLog = '';

      if (i.customId === 'z_kac') {
        collector.stop('kacti');
        return i.update({ embeds: [new EmbedBuilder().setColor('#FEE75C').setTitle('🏃 Zindandan Kaçtın!').setDescription('Canavarı arkanda bırakıp kaçtın.')], components: [] });
      }

      if (i.customId === 'z_iksir') {
        if (profil.iksir <= 0) {
          return i.reply({ content: '❌ Çantanda hiç Can İksiri kalmadı! Mağazadan satın alabilirsin.', ephemeral: true });
        }
        profil.iksir -= 1;
        oyuncuHp = Math.min(oyuncuMaxHp, oyuncuHp + 50);
        hamleLog = `🧪 İksir içtin ve **+50 HP** kazandın!`;
      }

      if (i.customId === 'z_savun') {
        savunmaAktif = true;
        hamleLog = `🛡️ Savunma pozisyonuna geçtin! Sonraki hasar yarıya düşecek.`;
      }

      if (i.customId === 'z_saldir') {
        let vurulanHasar = Math.max(5, (ap > 0 ? ap : atk) + Math.floor(Math.random() * 6));
        const kritikMi = Math.random() * 100 < kritikSans;

        if (kritikMi) vurulanHasar = Math.floor(vurulanHasar * 1.5);
        canavar.hp -= vurulanHasar;

        hamleLog = `${kritikMi ? '💥 **KRİTİK VURUŞ!** ' : ''}Canavara **${vurulanHasar}** hasar vurdun!`;
      }

      if (canavar.hp <= 0) {
        collector.stop('zafer');
        profil.xp += canavar.xp;
        profil.altin += canavar.altin;

        let seviyeAtladi = false;
        if (profil.xp >= profil.seviye * 100) {
          profil.seviye += 1;
          seviyeAtladi = true;
        }

        profilGuncelle(message.author.id, profil);

        const zaferEmbed = new EmbedBuilder()
          .setColor('#57F287')
          .setTitle(`🎉 Zafer! ${canavar.ad} Mağlup Edildi!`)
          .setDescription(`${hamleLog}\n\n💰 **Kazanılan Altın:** \`+${canavar.altin}\`\n⭐ **Kazanılan XP:** \`+${canavar.xp}\`${seviyeAtladi ? `\n\n🎊 **TEBRİKLER! LEVEL ATLADIN!**\nYeni Seviye: **${profil.seviye}**` : ''}`);

        return i.update({ embeds: [zaferEmbed], components: [] });
      }

      let canavarHasar = Math.max(2, canavar.atk - def);
      if (savunmaAktif) {
        canavarHasar = Math.floor(canavarHasar / 2);
        savunmaAktif = false;
      }

      oyuncuHp -= canavarHasar;

      if (oyuncuHp <= 0) {
        collector.stop('yenilgi');
        const yenilgiEmbed = new EmbedBuilder()
          .setColor('#ED4245')
          .setTitle(`☠️ Yenildin...`)
          .setDescription(`${canavar.ad} seni mağlup etti. Zindandan eli boş döndün!`);

        return i.update({ embeds: [yenilgiEmbed], components: [] });
      }

      const guncelEmbed = new EmbedBuilder()
        .setColor(canavar.renk)
        .setTitle(`⚔️ Zindan Savaşı: ${canavar.ad}`)
        .setDescription(`${hamleLog}\n👹 Canavar sana **${canavarHasar}** hasar vurdu!\n\n❤️ **Senin Canın:** \`${oyuncuHp}/${oyuncuMaxHp}\`\n🩸 **Canavar Canı:** \`${canavar.hp}/${canavarMaxHp}\``);

      iksirBtn.setLabel(`🧪 İksir (${profil.iksir})`);
      const guncelRow = new ActionRowBuilder().addComponents(saldirBtn, savunBtn, iksirBtn, kacBtn);

      await i.update({ embeds: [guncelEmbed], components: [guncelRow] });
    });
  }
};