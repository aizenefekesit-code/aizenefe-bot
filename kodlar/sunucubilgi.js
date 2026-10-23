const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'sunucu-bilgi',
  async run(message) {
    const { guild } = message;

    // Üye verileri
    const toplamUye = guild.memberCount;
    const kurucu = await guild.fetchOwner();
    const kurulus = `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`;

    const embed = new EmbedBuilder()
      .setColor('#FEE75C')
      .setTitle(`🏰 ${guild.name} — Sunucu İstatistikleri`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
      .addFields(
        { name: '👑 Sunucu Sahibi', value: `${kurucu}`, inline: true },
        { name: '👥 Toplam Üye', value: `\`${toplamUye}\` Kişi`, inline: true },
        { name: '💬 Kanal Sayısı', value: `\`${guild.channels.cache.size}\` Kanal`, inline: true },
        { name: '🎭 Rol Sayısı', value: `\`${guild.roles.cache.size}\` Rol`, inline: true },
        { name: '🚀 Takviye Seviyesi', value: `\`${guild.premiumTier}\` (Boost: ${guild.premiumSubscriptionCount || 0})`, inline: true },
        { name: '📅 Kuruluş Tarihi', value: kurulus, inline: false }
      )
      .setFooter({ text: `aizenefe Bot • Sunucu Bilgi`, iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }
};