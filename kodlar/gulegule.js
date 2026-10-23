const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const Canvas = require('canvas');

module.exports = {
  event: 'guildMemberRemove',
  async execute(member) {
    // ---------------- AYARLAR ----------------
    const kanalId = '1562841500436402258'; // Çıkış mesajının gideceği kanal ID'si
    // ------------------------------------------

    const kanal = member.guild.channels.cache.get(kanalId);
    if (!kanal) return;

    // 1. RESİMLİ GÜLE GÜLE KARTI (CANVAS)
    const canvas = Canvas.createCanvas(700, 250);
    const ctx = canvas.getContext('2d');

    // Arka plan koyu tema
    ctx.fillStyle = '#23272A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Çerçeve çizgisi (Kırmızı ton)
    ctx.strokeStyle = '#ED4245';
    ctx.lineWidth = 8;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Yazılar
    ctx.font = '28px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('GÜLE GÜLE!', 250, 80);

    ctx.font = '34px sans-serif';
    ctx.fillStyle = '#ED4245';
    ctx.fillText(member.user.username, 250, 130);

    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(`Aramızdan ayrıldı. Kalan üye: ${member.guild.memberCount}`, 250, 175);

    // Yuvarlak Profil Resmi
    const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await Canvas.loadImage(avatarUrl);

    ctx.beginPath();
    ctx.arc(125, 125, 75, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 50, 50, 150, 150);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'gulegule.png' });

    // Embed Kartı
    const embed = new EmbedBuilder()
      .setColor('#ED4245')
      .setTitle(`📤 Biri Aramızdan Ayrıldı...`)
      .setDescription(`**${member.user.username}** sunucumuzdan ayrıldı. Yolu açık olsun!`)
      .setImage('attachment://gulegule.png')
      .setFooter({ text: `${member.guild.name}`, iconURL: member.guild.iconURL() })
      .setTimestamp();

    kanal.send({ embeds: [embed], files: [attachment] });
  },
};