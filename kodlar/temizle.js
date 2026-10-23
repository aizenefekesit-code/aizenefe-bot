const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'temizle',
  async run(message) {
    // 1. Yetki Kontrolü
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      const yetkiHata = await message.reply('❌ Bu komutu kullanmak için `Mesajları Yönet` yetkisine sahip olmalısın!');
      return setTimeout(() => yetkiHata.delete().catch(() => {}), 3000); // 3 saniye sonra silinir
    }

    // 2. Botun Kendi Yetki Kontrolü
    if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
      const botHata = await message.reply('❌ Benim bu kanalda `Mesajları Yönet` yetkim yok!');
      return setTimeout(() => botHata.delete().catch(() => {}), 3000); // 3 saniye sonra silinir
    }

    // Mesaj içeriğinden sayıyı alma
    const args = message.content.trim().split(/\s+/);
    const miktar = parseInt(args[1]);

    // 3. Miktar Kontrolü
    if (!miktar || isNaN(miktar) || miktar < 1 || miktar > 100) {
      const miktarHata = await message.reply('⚠️ Lütfen silinecek miktarı belirt! (Örnek: `!temizle 10`)');
      return setTimeout(() => miktarHata.delete().catch(() => {}), 3000); // 3 saniye sonra silinir
    }

    try {
      // Önce kullanıcının attığı !temizle komut mesajını sil
      await message.delete().catch(() => {});

      // Kanaldaki mesajları toplu sil
      const silinenler = await message.channel.bulkDelete(miktar, true);

      const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setDescription(`✅ Başarıyla **${silinenler.size}** adet mesaj temizlendi!`)
        .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();

      const bilgi = await message.channel.send({ embeds: [embed] });
      
      // Başarı mesajını da 3 saniye sonra otomatik siler
      setTimeout(() => bilgi.delete().catch(() => {}), 3000);

    } catch (err) {
      console.error(err);
      const hata = await message.reply('❌ Mesajlar silinirken bir hata oluştu!');
      setTimeout(() => hata.delete().catch(() => {}), 3000);
    }
  },
};