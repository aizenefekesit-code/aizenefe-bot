const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const Canvas = require('canvas');

module.exports = {
  event: 'guildMemberAdd',
  async execute(member) {
    // ---------------- AYARLAR ----------------
    const kanalId = '1562841500436402258'; 
    const otorolId = ''; // Zorunlu değil, boş bırakabilirsin ''
    // ------------------------------------------

    const kanal = member.guild.channels.cache.get(kanalId);

    // 1. OTO-ROL VERME
    if (otorolId) {
      const rol = member.guild.roles.cache.get(otorolId);
      if (rol) {
        member.roles.add(rol).catch(err => console.log('Oto-rol verme hatası:', err));
      }
    }

    // 2. RESİMLİ HOŞ GELDİN KARTI (CANVAS)
    if (kanal) {
      const canvas = Canvas.createCanvas(700, 250);
      const ctx = canvas.getContext('2d');

      // Arka plan koyu tema
      ctx.fillStyle = '#23272A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Çerçeve çizgisi
      ctx.strokeStyle = '#5865F2';
      ctx.lineWidth = 8;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      // Yazılar
      ctx.font = '28px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('HOŞ GELDİN!', 250, 80);

      ctx.font = '34px sans-serif';
      ctx.fillStyle = '#5865F2';
      ctx.fillText(member.user.username, 250, 130);

      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#aaaaaa';
      ctx.fillText(`Sunucunun ${member.guild.memberCount}. üyesisin!`, 250, 175);

      // Yuvarlak Profil Resmi
      const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 256 });
      const avatar = await Canvas.loadImage(avatarUrl);

      ctx.beginPath();
      ctx.arc(125, 125, 75, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 50, 50, 150, 150);

      const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'hosgeldin.png' });

      // Embed ile Birlikte Gönderme
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`🎉 ${member.guild.name} Sunucusuna Hoş Geldin!`)
        .setDescription(`Aramıza katıldığın için çok mutluyuz ${member}! Keyifli vakit geçirmeni dileriz.`)
        .setImage('attachment://hosgeldin.png')
        .setFooter({ text: `${member.guild.name}`, iconURL: member.guild.iconURL() })
        .setTimestamp();

      kanal.send({ embeds: [embed], files: [attachment] });
    }
  },
};