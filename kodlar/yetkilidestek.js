const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'yetkilidestek',
  async run(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('❌ Bu menüyü görüntülemek için yetkin yetersiz!');
    }

    const embed = new EmbedBuilder()
      .setColor('#ED4245')
      .setTitle('🛡️ aizenefe — Yetkili Yönetim Menüsü')
      .setDescription('Yetkili ekibinin kullanabileceği gelişmiş yönetim ve ceza komutları:')
      .addFields(
        { 
          name: '🔨 Ceza Komutları', 
          value: '`!mute @üye [süre] [sebep]` • Üyeyi metin kanallarında susturur.\n`!unmute @üye` • Üyenin susturmasını kaldırır.\n`!kick @üye [sebep]` • Üyeyi sunucudan atar.\n`!ban @üye [sebep]` • Üyeyi sunucudan yasaklar.\n`!unban [ID]` • Yasaklı üyenin banını kaldırır.', 
          inline: false 
        },
        { 
          name: '🎉 Etkinlik & Yönetim', 
          value: '`!çekiliş [süre] [kazanan_sayısı] [ödül]` • Sunucuda otomatik butonlu çekiliş başlatır.', 
          inline: false 
        }
      )
      .setFooter({ text: `${message.guild.name} • Yetkili Paneli`, iconURL: message.guild.iconURL() })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }
};