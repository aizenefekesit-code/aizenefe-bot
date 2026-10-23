const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'profil',
  async run(message) {
    const hedef = message.mentions.members.first() || message.member;

    const katilisTarihi = `<t:${Math.floor(hedef.joinedTimestamp / 1000)}:R>`;
    const kurulusTarihi = `<t:${Math.floor(hedef.user.createdTimestamp / 1000)}:R>`;

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`👤 ${hedef.user.username} — Kullanıcı Profil Bilgileri`)
      .setThumbnail(hedef.user.displayAvatarURL({ dynamic: true, size: 512 }))
      .addFields(
        { name: '🆔 Kullanıcı ID', value: `\`${hedef.id}\``, inline: true },
        { name: '👑 En Yüksek Rol', value: `${hedef.roles.highest}`, inline: true },
        { name: '📅 Sunucuya Katılım', value: katilisTarihi, inline: false },
        { name: '📆 Discord Kayıt Tarihi', value: kurulusTarihi, inline: false }
      )
      .setFooter({ text: `${message.guild.name} • Profil Sistemi`, iconURL: message.guild.iconURL() })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }
};