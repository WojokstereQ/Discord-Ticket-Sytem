const { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, GatewayIntentBits, Partials, PermissionsBitField, ChannelType } = require('discord.js');
const express = require('express');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.User],
});

// Ustawienia Express
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  const imagePath = path.join(__dirname, 'index.html');
  res.sendFile(imagePath);
});

app.listen(port, () => {
  console.log('\x1b[36m[ SERWER ]\x1b[0m', '\x1b[32m SH : http://localhost:' + port + ' ✅\x1b[0m');
});

// Konfiguracja systemu ticketów
const config = require("./config.js");
const owner = config.modmail.ownerID;
const supportcat = config.modmail.supportId;
const premiumcat = config.modmail.premiumId;
const whitelistrole = config.modmail.whitelist;
const staffID = config.modmail.staff;
const log = config.logs.logschannel;
const cooldowns = new Map(); // Mapa do śledzenia cooldownów

client.once('ready', () => {
  console.log(client.user.username + ' jest gotowy!');
});

// Obsługa poleceń ticketów
client.on("messageCreate", async (message) => {
  if (message.author.id === owner && message.content.toLowerCase().startsWith("!ticket-embed")) {
    message.delete();
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setLabel("📨 Pomoc").setStyle(ButtonStyle.Secondary).setCustomId("support"),
        new ButtonBuilder().setLabel("💸 Zakup").setStyle(ButtonStyle.Secondary).setCustomId("premium")
      );

    const ticketmsg = new EmbedBuilder()
      .setTitle(`${message.guild.name} ➜ System Ticketów`)
      .setDescription(`**Witamy w naszym systemie wsparcia!** 🎫
>>> - Jeżeli potrzebujesz pomocy ogólnej, lub masz pytania, skorzystaj z opcji **__Pomoc__**.
- Jeżeli chcesz złożyć zamówienie bądź dowiedzieć się o szczegółach produktów, skorzystaj z opcji **__Zakup__**.`)
      .setFooter({ text: `${message.guild.name} | Stworzone z ❤️ przez zespół GTADEALS.`, iconURL: message.guild.iconURL() })
      .setColor("#e87a59");

    message.channel.send({ embeds: [ticketmsg], components: [row] });
  }

  // Komenda do ustawienia
  if (message.author.bot || !message.guild) return;
  if (message.content.toLowerCase() === `!setup`) {
    const generalTicketsCategory = await message.guild.channels.create({ name: 'General Tickets', type: ChannelType.GuildCategory });
    const premiumTicketsCategory = await message.guild.channels.create({ name: 'Premium Tickets', type: ChannelType.GuildCategory });
    const ticketLogsCategory = await message.guild.channels.create({ name: 'Logs', type: ChannelType.GuildCategory });

    await message.guild.channels.create({
      name: `ticket logs`,
      type: ChannelType.GuildText,
      parent: ticketLogsCategory,
      permissionOverwrites: [{ id: message.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] }],
    });

    message.channel.send('Konfiguracja ticketów zakończona!');
  }
});

// Obsługa interakcji dla ticketów
client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isButton()) {
      const userId = interaction.user.id;
      const userCooldown = cooldowns.get(userId) || 0;
      const currentTime = Date.now();

      if (userCooldown > currentTime && (interaction.customId === "support" || interaction.customId === "premium")) {
        const remainingTime = Math.ceil((userCooldown - currentTime) / 1000);
        interaction.reply({
          content: `Jesteś na cooldownie. Poczekaj ${remainingTime} sekund przed otwarciem kolejnego ticketa.`,
          ephemeral: true,
        });
        return;
      }

      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel("⚙️ Zarządzaj").setCustomId("close").setStyle(ButtonStyle.Primary)
      );

      const ticketChannelName = `ticket-${interaction.user.username}`;
      let ticketCategory;
      let ticketDescription;

      if (interaction.customId === "support") {
        ticketCategory = supportcat;
        ticketDescription = `**Cześć!**\nProszę podaj szczegółowy opis swojego zapytania, a jeden z naszych członków zespołu pomoże Ci wkrótce.`;
      } else if (interaction.customId === "premium") {
        ticketCategory = premiumcat;
        ticketDescription = `**Witaj!**\nPotrzebujesz pomocy z naszymi funkcjami premium? Podziel się szczegółami swojego zapytania, a nasz zespół skontaktuje się z Tobą wkrótce.`;
      }

      const ticket = await interaction.guild.channels.create({
        name: ticketChannelName,
        type: ChannelType.GuildText,
        parent: ticketCategory,
        permissionOverwrites: [
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
            ],
          },
          {
            id: whitelistrole,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
            ],
          },
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
        ],
      });

      interaction.reply({
        content: `<#${ticket.id}> został utworzony dla Ciebie.`,
        ephemeral: true,
      });

      client.channels.cache.get(log).send(`# Nowy Ticket\n\n**Użytkownik:** <@${interaction.user.id}> otworzył <#${ticket.id}>`);

      ticket.send({
        content: `<@&${staffID}>\n**==========================**`,
        embeds: [
          new EmbedBuilder()
            .setTitle(`${interaction.user.displayName}'s Ticket`)
            .setDescription(ticketDescription)
            .setFooter({ text: `User ID: ${interaction.user.id}` })
            .setColor("#2a043b")
        ],
        components: [row2],
      });

      cooldowns.set(userId, currentTime + 2 * 60 * 60 * 1000); // cooldown 2 godziny
    }
  } catch (e) {
    console.error(e);
  }
});

// Logowanie
client.login(process.env.TOKEN);
