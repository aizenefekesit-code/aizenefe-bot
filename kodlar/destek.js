const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'destek',
  async run(message) {
    const embed = new EmbedBuilder()
      .setColor('#57F287')
      .setTitle('🤖 aizenefe — Oyuncu Komut Menüsü')
      .setDescription('Sunucuda kullanabileceğin oyuncu komutları aşağıda yer almaktadır:')
      .addFields(
        { 
          name: '👥 Genel & Bilgi', 
          value: '`!profil` • Profil ve hesap detaylarını gösterir.\n`!sunucu-bilgi` • Sunucu istatistiklerini görüntüler.', 
          inline: false 
        },
        { 
          name: '🎮 Eğlence & Oyunlar', 
          value: '`!tkm [taş/kağıt/makas]` • Botla taş-kağıt-makas oynarsın.\n`!zindan` • Zindana girer, macera yaşarsın.', 
          inline: false 
        },
        { 
          name: '❓ Yardım', 
          value: '`!destek` • Bu yardım menüsünü açar.', 
          inline: false 
        }
      )
      .setFooter({ text: `${message.guild.name} • Oyuncu Destek`, iconURL: message.guild.iconURL() })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }
};