const { 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ChannelType, 
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require('discord.js');

const YETKILI_ROL_ID = '123456789012345678'; 
const UST_EKIP_ROL_ID = '123456789012345679';

let ticketSayaci = 1;

module.exports = {
  name: 'ticket-kur',
  async run(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ Bu komutu kullanmak için `Yönetici` yetkisine sahip olmalısın!');
    }

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎫 aizenefe — Destek Sistemi')
      .setDescription(
        'Sunucumuzda yardıma ihtiyacın varsa veya bir sorun yaşadıysan aşağıdaki **`📩 Destek Talebi Aç`** butonuna basarak özel destek odası oluşturabilirsin.'
      )
      .addFields(
        { name: '⏰ Destek Saatleri', value: 'Yetkili ekibimiz en kısa sürede talebinize dönüş yapacaktır.', inline: false }
      )
      .setFooter({ text: `${message.guild.name} • Destek Sistemi`, iconURL: message.guild.iconURL() })
      .setTimestamp();

    const acBtn = new ButtonBuilder()
      .setCustomId('ticket_ac_modal_tetikle')
      .setLabel('📩 Destek Talebi Aç')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(acBtn);

    await message.channel.send({ embeds: [embed], components: [row] });
    message.delete().catch(() => {});
  },

  async interactionHandler(interaction) {
    // 1. ÜYE BUTONA BASTIĞINDA MODAL AÇ
    if (interaction.isButton() && interaction.customId === 'ticket_ac_modal_tetikle') {
      const modal = new ModalBuilder()
        .setCustomId('modal_ticket_olustur')
        .setTitle('Destek Talebi Oluştur');

      const sebepInput = new TextInputBuilder()
        .setCustomId('input_ticket_sebep')
        .setLabel('Talebi Açma Sebebiniz Nedir?')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Yaşadığınız sorunu açıklayın...')
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(sebepInput));
      return interaction.showModal(modal);
    }

    // 2. MODAL FORMU GÖNDERİLDİĞİNDE (SINIRSIZ - DOĞRUDAN KANALI AÇAR)
    if (interaction.isModalSubmit() && interaction.customId === 'modal_ticket_olustur') {
      await interaction.deferReply({ ephemeral: true });

      const sebep = interaction.fields.getTextInputValue('input_ticket_sebep');

      let kategori = interaction.guild.channels.cache.find(c => c.name.toLowerCase() === 'ticket' && c.type === ChannelType.GuildCategory);
      if (!kategori) {
        kategori = await interaction.guild.channels.create({
          name: 'TICKET',
          type: ChannelType.GuildCategory
        }).catch(() => null);
      }

      const kanalAdi = `destek-${String(ticketSayaci).padStart(4, '0')}`;
      ticketSayaci++;

      try {
        const overwrites = [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles]
          }
        ];

        if (YETKILI_ROL_ID && YETKILI_ROL_ID !== '123456789012345678') {
          overwrites.push({
            id: YETKILI_ROL_ID,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles]
          });
        }

        const ticketKanal = await interaction.guild.channels.create({
          name: kanalAdi,
          type: ChannelType.GuildText,
          parent: kategori ? kategori.id : null,
          permissionOverwrites: overwrites
        });

        const panelEmbed = new EmbedBuilder()
          .setColor('#FEE75C')
          .setTitle(`🎫 Destek Talebi: ${interaction.user.username}`)
          .setDescription(`Hoş geldin ${interaction.user}!\n\n📝 **Talep Sebebi:**\n> *${sebep}*\n\n⏳ **Durum:** Beklemede (Henüz bir yetkili tarafından sahiplenilmedi)\n👤 **Sahiplenen Yetkili:** \`Yok\``)
          .setFooter({ text: 'İşlem yapmak için aşağıdaki butonları kullanabilirsin.' })
          .setTimestamp();

        const row1 = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('ticket_sahiplen').setLabel('🙋‍♂️ Sahiplen').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId('ticket_kapat').setLabel('🔒 Kapat').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('ticket_sil').setLabel('🗑️ Sil').setStyle(ButtonStyle.Danger)
        );

        const row2 = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('ticket_uye_ekle_modal').setLabel('➕ Üye Ekle').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('ticket_devret').setLabel('🔄 Devret').setStyle(ButtonStyle.Primary)
        );

        await ticketKanal.send({ content: `${interaction.user}`, embeds: [panelEmbed], components: [row1, row2] });
        await interaction.editReply({ content: `✅ Destek talebin başarıyla oluşturuldu: ${ticketKanal}` });
      } catch (err) {
        console.error('Ticket oluşturma hatası:', err);
        await interaction.editReply({ content: '❌ Destek kanalı oluşturulurken bir hata oluştu!' });
      }
    }

    // ÜYE EKLEME MODALI GÖNDERİMİ
    if (interaction.isModalSubmit() && interaction.customId === 'modal_uye_ekle') {
      const userID = interaction.fields.getTextInputValue('input_uye_id');
      const hedefUye = await interaction.guild.members.fetch(userID).catch(() => null);

      if (!hedefUye) {
        return interaction.reply({ content: '❌ Belirtilen ID ile eşleşen bir üye bulunamadı!', ephemeral: true });
      }

      await interaction.channel.permissionOverwrites.edit(hedefUye.id, {
        ViewChannel: true,
        SendMessages: true,
        AttachFiles: true
      });

      return interaction.reply({ content: `✅ Başarılı! ${hedefUye} destek talebine dahil edildi.` });
    }

    if (!interaction.isButton()) return;

    // SAHİPLENME
    if (interaction.customId === 'ticket_sahiplen') {
      await interaction.channel.permissionOverwrites.edit(YETKILI_ROL_ID, { ViewChannel: false }).catch(() => {});
      await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
        ViewChannel: true,
        SendMessages: true,
        AttachFiles: true
      });

      const mesaj = interaction.message;
      const eskiEmbed = mesaj.embeds[0];

      const yeniEmbed = EmbedBuilder.from(eskiEmbed)
        .setColor('#57F287')
        .setDescription(eskiEmbed.description.replace('⏳ **Durum:** Beklemede (Henüz bir yetkili tarafından sahiplenilmedi)', '🟢 **Durum:** İlgileniliyor').replace('👤 **Sahiplenen Yetkili:** `Yok`', `👤 **Sahiplenen Yetkili:** ${interaction.user}`));

      await mesaj.edit({ embeds: [yeniEmbed] });
      await interaction.reply({ content: `✅ Bu destek talebini sahiplendin. Kanal diğer yetkililerin gözünden gizlendi.` });
    }

    // DEVRETME
    if (interaction.customId === 'ticket_devret') {
      const mesaj = interaction.message;
      await interaction.channel.permissionOverwrites.edit(YETKILI_ROL_ID, { ViewChannel: true, SendMessages: true }).catch(() => {});

      const eskiEmbed = mesaj.embeds[0];
      const yeniEmbed = EmbedBuilder.from(eskiEmbed)
        .setColor('#FEE75C')
        .setDescription(eskiEmbed.description.replace('🟢 **Durum:** İlgileniliyor', '⏳ **Durum:** Beklemede (Henüz bir yetkili tarafından sahiplenilmedi)').replace(/👤 \*\*Sahiplenen Yetkili:\*\* .*/, '👤 **Sahiplenen Yetkili:** `Yok`'));

      await mesaj.edit({ embeds: [yeniEmbed] });
      await interaction.reply({ content: `🔄 Destek talebi devredildi. Kanal tekrar tüm yetkililerin erişimine açıldı.` });
    }

    // ÜYE EKLEME
    if (interaction.customId === 'ticket_uye_ekle_modal') {
      const modal = new ModalBuilder()
        .setCustomId('modal_uye_ekle')
        .setTitle('Ticket\'a Üye Ekle');

      const input = new TextInputBuilder()
        .setCustomId('input_uye_id')
        .setLabel('Eklenecek Üyenin ID\'si')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Örn: 3847291048572910')
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(input));
      return interaction.showModal(modal);
    }

    // KAPATMA
    if (interaction.customId === 'ticket_kapat') {
      await interaction.channel.permissionOverwrites.edit(interaction.user.id, { SendMessages: false });
      await interaction.reply({ content: '🔒 Destek talebi kapatıldı. Üyenin mesaj yazması engellendi.' });
    }

    // SİLME
    if (interaction.customId === 'ticket_sil') {
      await interaction.reply({ content: '🗑️ Destek talebi 5 saniye içinde siliniyor...' });
      setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 5000);
    }
  }
};