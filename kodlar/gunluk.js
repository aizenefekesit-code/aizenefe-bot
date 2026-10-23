const { EmbedBuilder } = require('discord.js');
const { profilGetir, profilGuncelle } = require('./zindanYardimci');

module.exports = {
  name: 'günlük',
  async run(message) {
    const profil = profilGetir(message.author.id);
    const simdi = Date.now();
    const beklemeSuresi = 24 * 60 * 60 * 1000; // 24 Saat

    if (simdi - profil.sonGunluk < beklemeSuresi) {
      const kalanKalanMs = beklemeSuresi - (simdi - profil.sonGunluk);
      const kalanSaat = Math.floor(kalanKalanMs / (1000 * 60 * 60));
      const kalanDakika = Math.floor((kalanKalanMs % (1000 * 60 * 60)) / (1000 * 60));

      const hataEmbed = new EmbedBuilder()
        .setColor('#ED4245')
        .setTitle('⏳ Günlük Ödül Henüz Hazır Değil')
        .setDescription(`Günlük altın ödülünü zaten aldın!\nTekrar alabilmek için **${kalanSaat} saat ${kalanDakika} dakika** beklemelisin.`);

      return message.reply({ embeds: [hataEmbed] });
    }

    const kazanilanAltin = Math.floor(Math.random() * 150) + 150; // 150-300 Altın
    profil.altin += kazanilanAltin;
    profil.sonGunluk = simdi;
    profilGuncelle(message.author.id, profil);

    const basariEmbed = new EmbedBuilder()
      .setColor('#57F287')
      .setTitle('💰 Günlük Ödül Alındı!')
      .setDescription(`Hesabına **+${kazanilanAltin} Altın** eklendi!\n\n💰 **Toplam Altının:** \`${profil.altin}\``)
      .setFooter({ text: `${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    message.reply({ embeds: [basariEmbed] });
  }
};