const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'zindanyardım',
  async run(message) {
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('⚔️ Zindan & RPG — Maceracı Kılavuzu')
      .setDescription(
        'Zindan evrenine hoş geldin! Zindanlarda savaşarak altın ve XP kazanabilir, kazandığın altınlarla mağazadan efsanevi ekipmanlar satın alarak sıralamada zirveye oynayabilirsin.'
      )
      .addFields(
        {
          name: '📜 Temel RPG Komutları',
          value:
            '• `!zindan` — Zindana girer ve karşına çıkan canavarla savaşmanı sağlar.\n' +
            '• `!mağaza` — Kılıç, zırh, büyü asası, yüzük ve iksir satın alabileceğin marketi açar.\n' +
            '• `!günlük` — Her 24 saatte bir ücretsiz altın ödülü almanı sağlar.\n' +
            '• `!liderlik` — Sunucudaki en yüksek seviye ve altın sahibi savaşçıları listeler.\n' +
            '• `!envanter` — Kuşandığın eşyaları, canını ve kalan iksirlerini gösterir.'
        },
        {
          name: '🗡️ Ekipman Türleri ve Bonusu',
          value:
            '• **Silahlar & Büyü Asaları:** Fiziksel veya büyü hasarını (ATK/AP) arttırır.\n' +
            '• **Zırhlar:** Savunmanı (DEF) arttırarak canavarlardan aldığın hasarı düşürür ve ekstra Can (HP) verir.\n' +
            '• **Sihirli Yüzükler:** Kritik vuruş şansını arttırır ve ekstra stat sağlar.\n' +
            '• **İksirler:** Zindan savaşları sırasında canını anında yenilemeni sağlar.'
        },
        {
          name: '💡 İpucu',
          value: 'Zindana girmeden önce mutlaka mağazadan en azından bir **Tahta Kılıç** ve **Can İksiri** almayı unutma!'
        }
      )
      .setFooter({ text: `${message.guild.name} • RPG Sistem Kılavuzu`, iconURL: message.guild.iconURL() })
      .setTimestamp();

    const magazaBtn = new ButtonBuilder()
      .setCustomId('rehber_magaza_bilgi')
      .setLabel('🛒 Mağazaya Git (!mağaza)')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(magazaBtn);

    message.channel.send({ embeds: [embed], components: [row] });
  }
};