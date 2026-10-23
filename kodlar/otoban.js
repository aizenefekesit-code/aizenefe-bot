const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  event: 'messageCreate',
  async execute(message) {
    if (message.author.bot || !message.guild) return;
    
    // Yetkilileri (Mesajları Yönet yetkisi olanları) pas geç
    if (message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return;

    const cezalogKanalId = '1562891418320502804';
    const icerik = message.content.toLowerCase();

    // Otomatik Ban Tetikleyicileri (Örn: Discord Sunucu Davet Linkleri)
    const discordLinkRegex = /(discord\.gg|discord\.com\/invite|discordapp\.com\/invite)\/[a-zA-Z0-9]+/i;

    let banSebebi = null;

    if (discordLinkRegex.test(icerik)) {
      banSebebi = 'Sunucu Reklamı / Discord Davet Linki Paylaşımı';
    }

    if (banSebebi) {
      const kanitMesaj = message.content;

      try {
        // 1. Reklam / İhlal Mesajını Sil
        await message.delete().catch(() => {});

        // 2. Üyeye DM'den Bilgi Gönder
        const dmEmbed = new EmbedBuilder()
          .setColor('#ED4245')
          .setTitle(`⛔ ${message.guild.name} • Otomatik Ban Sistemi`)
          .setThumbnail(message.guild.iconURL({ dynamic: true }))
          .setDescription(`Sunucu kurallarını ağır şekilde ihlal ettiğiniz için sistem tarafından otomatik olarak yasaklandınız.`)
          .addFields(
            { name: '🛡️ İşlem Yapan', value: '`Otomatik Bot Koruması`', inline: true },
            { name: '📝 Tespit Edilen İhlal', value: `\`\`\`${banSebebi}\`\`\``, inline: false }
          )
          .setFooter({ text: `${message.guild.name} • Otomatik Güvenlik`, iconURL: message.guild.iconURL() })
          .setTimestamp();

        await message.author.send({ embeds: [dmEmbed] }).catch(() => {});

        // 3. Sunucudan Banla
        await message.guild.members.ban(message.author.id, { reason: `Otomatik Ban: ${banSebebi}` });

        // 4. Cezalog Kanalına Kanıtlı Log Düşür
        const logKanal = message.guild.channels.cache.get(cezalogKanalId);
        if (logKanal) {
          const logEmbed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('🤖 Otomatik Ban (Yasaklama) Raporu')
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .addFields(
              { name: '👤 Yasaklanan Üye', value: `${message.author.tag}\n(\`<@${message.author.id}>\`)`, inline: true },
              { name: '🛡️ İşlem Yapan', value: 'Otomatik Bot Koruması', inline: true },
              { name: '📝 Sebep', value: `${banSebebi}`, inline: false },
              { name: '📸 Kanıt (Atılan Mesaj)', value: `\`\`\`${kanitMesaj || 'Mesaj okunamadı'}\`\`\``, inline: false }
            )
            .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })
            .setTimestamp();

          logKanal.send({ embeds: [logEmbed] });
        }

      } catch (err) {
        console.error('Otomatik Ban Hatası:', err);
      }
    }
  },
};