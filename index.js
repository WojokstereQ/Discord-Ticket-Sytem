const { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, GatewayIntentBits, Partials, PermissionsBitField, ChannelType, ActivityType } = require('discord.js');
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

// Express setup
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  const imagePath = path.join(__dirname, 'index.html');
  res.sendFile(imagePath);
});

app.listen(port, () => {
  console.log('\x1b[36m[ SERVER ]\x1b[0m', '\x1b[32m SH : http://localhost:' + port + ' ✅\x1b[0m');
});

// Ticket system configurations
const config = require("./config.js");
const owner = config.modmail.ownerID;
const supportcat = config.modmail.supportId;
const premiumcat = config.modmail.premiumId;
const whitelistrole = config.modmail.whitelist;
const staffID = config.modmail.staff;
const log = config.logs.logschannel;
const cooldowns = new Map(); // Map to track cooldowns

client.once('ready', () => {
  console.log(client.user.username + ' is ready!');
  console.log('== The logs are starting from here ==');
  updateStatus();
  setInterval(updateStatus, 10000);
  heartbeat();
});

const statusMessages = ["Daj bliczka..", "🎮 Playing GTA VI", "Zaobserwuj nas na tiktok'u: @gta.deals"];
const statusTypes = ['dnd', 'idle'];
let currentStatusIndex = 0;
let currentTypeIndex = 0;

async function updateStatus() {
  const currentStatus = statusMessages[currentStatusIndex];
  const currentType = statusTypes[currentTypeIndex];
  client.user.setPresence({
    activities: [{ name: currentStatus, type: ActivityType.Custom }],
    status: currentType,
  });
  console.log('\x1b[33m[ STATUS ]\x1b[0m', `Updated status to: ${currentStatus} (${currentType})`);
  currentStatusIndex = (currentStatusIndex + 1) % statusMessages.length;
  currentTypeIndex = (currentTypeIndex + 1) % statusTypes.length;
}

function heartbeat() {
  setInterval(() => {
    console.log('\x1b[35m[ HEARTBEAT ]\x1b[0m', `Bot is alive at ${new Date().toLocaleTimeString()}`);
  }, 30000);
}

// Ticket command handling
client.on("messageCreate", async (message) => {
  if (message.author.id === owner && message.content.toLowerCase().startsWith("!ticket-embed")) {
    message.delete();
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setLabel("📨 Support").setStyle(ButtonStyle.Secondary).setCustomId("support"),
        new ButtonBuilder().setLabel("💸 Premium").setStyle(ButtonStyle.Secondary).setCustomId("premium")
      );

    const ticketmsg = new EmbedBuilder()
      .setTitle(`${message.guild.name}'s Ticket System`)
      .setDescription(`**Welcome to our Support Ticket System!** 🎫
*To ensure prompt assistance, please click on one of the buttons below to open a ticket...*`)
      .setFooter({ text: `${message.guild.name} | Made with ❤️ by GTADEALS`, iconURL: message.guild.iconURL() })
      .setColor("#e87a59");

    message.channel.send({ embeds: [ticketmsg], components: [row] });
  }

  // Setup command
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

    message.channel.send('Ticket setup completed!');
  }
});

// Interaction handling for tickets
client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isButton()) {
      // Button interaction logic here...
      // Handle ticket creation, cooldowns, etc.
    }
  } catch (e) {
    console.error(e);
  }
});

// Login
client.login(process.env.TOKEN);
