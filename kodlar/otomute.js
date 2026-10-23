const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const kufurler = [
  'amk', 'aq', 'amq', 'oç', 'oc', 'piç', 'pic', 'yarrak', 'yarak',
  'sik', 'sikiş', 'orospu', 'ibne', 'yavşak', 'yavsak', 'göt'
];

const spamHaritasi = new Map();

module.exports = {
  event: 'messageCreate',
  async execute(message) {
    if (message.author.bot || !message.guild) return;
    if (message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return;

    const cezaliRolId = '1562891312427044874';
    const cezalogKanalId = '1562891418320502804';

    const icerik = message.content.toLowerCase();
    const kelimeler = icerik.split(/\s+/);

    let cezaSebebi = null;
    let muteSuresiMs = 10 * 60 * 1000; // 10 Dakika
    let sureMetni = '10dk';

    const kufurTespit = kelimeler.some(kelime => kufurler.includes(kelime));
    if (kufurTespit) {
      cezaSebebi = 'Yasaklı Kelime / Küfür Kullanımı';
    }

    if (!cezaSebebi) {
      const simdi = Date.now();
      const kullaniciVerisi = spamHaritasi.get(message.author.id) || [];
      const filtreliVeri = kullaniciVerisi.filter(zaman => simdi - zaman < 5000);
      filtreliVeri.push(simdi);
      spamHaritasi.set(message.author.id, filtreliVeri);

      if (filtreliVeri.length >= 5) {
        cezaSebebi = 'Hızlı Mesaj Spami (5sn içinde 5+ mesaj)';
        spamHaritasi.delete(message.author.id);
      }
    }

    if (cezaSebebi) {
      const kanitMesaj = message.content;

      try {
        await message.delete().catch(() => {});
        await message.member.timeout(muteSuresiMs, `Otomatik Mute: ${cezaSebebi}`);
        await message.member.roles.add(cezaliRolId).catch(() => {});

        // 1. ÜYEYE OTOMATİK DM EMBED BİLDİRİMİ
        const dmEmbed = new EmbedBuilder()
          .setColor('#ED4245')
          .setTitle(`🤖 ${message.guild.name} • Otomatik Mute Sistemi`)
          .setThumbnail(message.guild.iconURL({ dynamic: true }))
          .setDescription(`Otomatik güvenlik korumasına takıldığınız için geçici olarak sustained edildiniz.`)
          .addFields(
            { name: '⏱️ Susturulma Süresi', value: `\`${sureMetni}\``, inline: true },
            { name: '🛡️ İşlem Yapan', value: '`Otomatik Bot Koruması`', inline: true },
            { name: '📝 Tespit Edilen İhlal', value: `\`\`\`${cezaSebebi}\`\`\``, inline: false }
          )
          .setFooter({ text: `${message.guild.name} • Otomatik Güvenlik`, iconURL: message.guild.iconURL() })
          .setTimestamp();

        await message.author.send({ embeds: [dmEmbed] }).catch(() => {});

        // 2. CEZALOG KANALINA KANITLI EMBED LOG
        const logKanal = message.guild.channels.cache.get(cezalogKanalId);
        if (logKanal) {
          const logEmbed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('🤖 Otomatik Mute (Susturma) Raporu')
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .addFields(
              { name: '👤 Susturulan Üye', value: `${message.author.tag}\n(\`<@${message.author.id}>\`)`, inline: true },
              { name: '🛡️ İşlem Yapan', value: 'Otomatik Bot Koruması', inline: true },
              { name: '⏱️ Süre', value: `\`${sureMetni}\``, inline: true },
              { name: '📝 Sebep', value: `${cezaSebebi}`, inline: false },
              { name: '📸 Kanıt (Atılan Mesaj)', value: `\`\`\`${kanitMesaj || 'Mesaj okunamadı'}\`\`\``, inline: false }
            )
            .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })
            .setTimestamp();

          logKanal.send({ embeds: [logEmbed] });
        }

      } catch (err) {
        console.error('Otomatik mute hatası:', err);
      }
    }
  },
};