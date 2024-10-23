const { Client, EmbedBuilder,GatewayIntentBits,ActivityType, StringSelectMenuBuilder, ActionRowBuilder, GatewayIntentBits, Partials, time, PermissionsBitField, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
require('dotenv').config2();
const express = require('express');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ],
});

const app = express();
const port = 3000;
app.get('/', (req, res) => {
  const imagePath = path.join(__dirname, 'index.html');
  res.sendFile(imagePath);
});
app.listen(port, () => {
  console.log('\x1b[36m[ SERVER ]\x1b[0m', '\x1b[32m SH : http://localhost:' + port + ' ✅\x1b[0m');
});

const statusMessages = ["Daj bliczka..", "🎮 Playing GTA VI", "Zaobserwuj nas na tiktok'u: @gta.deals"];
const statusTypes = [ 'dnd', 'idle'];
let currentStatusIndex = 0;
let currentTypeIndex = 0;

async function login() {
  try {
    await client.login(process.env.TOKEN);
    console.log('\x1b[36m[ LOGIN ]\x1b[0m', `\x1b[32mLogged in as: ${client.user.tag} ✅\x1b[0m`);
    console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[35mBot ID: ${client.user.id} \x1b[0m`);
    console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mConnected to ${client.guilds.cache.size} server(s) \x1b[0m`);
  } catch (error) {
    console.error('\x1b[31m[ ERROR ]\x1b[0m', 'Failed to log in:', error);
    process.exit(1);
  }
}

function updateStatus() {
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

client.once('ready', () => {
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mPing: ${client.ws.ping} ms \x1b[0m`);
  updateStatus();
  setInterval(updateStatus, 10000);
  heartbeat();
});
const client = new Client({
  intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
        Partials.Reaction,
        Partials.ThreadMember
    ]
});

  // Host the bot:
  require('http')
    .createServer((req, res) => res.end(''))
    .listen(3030);

  client.once('ready', () => {
    console.log(client.user.username + ' is ready!');
    console.log('== The logs are starting from here ==');
  });

const config = require("./config.js");
const owner = config.modmail.ownerID
const supportcat = config.modmail.supportId
const premiumcat = config.modmail.premiumId
const whitelistrole = config.modmail.whitelist
const staffID = config.modmail.staff
const log = config.logs.logschannel;
const cooldowns = new Map(); // Map to track cooldowns

client.on("messageCreate", async (message) => {
  if (message.author.id === owner) {
    if (message.content.toLowerCase().startsWith("!ticket-embed")) {
      message.delete();
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel("📨 Support")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("support"),
          new ButtonBuilder()
            .setLabel("💸 Premium")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("premium")
        );

      const ticketmsg = new EmbedBuilder()
        .setTitle(`${message.guild.name}'s Ticket System`)
        .setDescription(
          `**Welcome to our Support Ticket System!** 🎫

*To ensure prompt assistance, please click on one of the buttons below to open a ticket in the category that best fits your inquiry. Our dedicated support team is ready to help you with any questions or issues you may encounter. Choose the appropriate category, and we'll get back to you as soon as possible.*

🛠️ **Pomoc:** W przypadku ogólnych pytań lub informacji.

💸 **Zakupy:** Zapytaj o jeden z naszych produktów lub usług.

*Dziękujemy za kontakt! Twoja satysfakcja jest naszym priorytetem.*`
        )
        .setFooter({ text: `${message.guild.name} | Made with ❤️ by GTADEALS`, iconURL: message.guild.iconURL() })
        .setColor("#e87a59");

      message.channel.send({
        embeds: [ticketmsg],
        components: [row],
      });
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isButton()) {
      const userId = interaction.user.id;
      const userCooldown = cooldowns.get(userId) || 0;
      const currentTime = Date.now();

      if (userCooldown > currentTime && (interaction.customId === "support" || interaction.customId === "premium")) {
        const remainingTime = Math.ceil((userCooldown - currentTime) / 1000);
        interaction.reply({
          content: `You're on a cooldown. Please wait ${remainingTime} seconds before opening another ticket.`,
          ephemeral: true,
        });
        return;
      }

      if (interaction.customId === "support" || interaction.customId === "premium") {
        const row2 = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("⚙️ Zarządzaj")
            .setCustomId("Zamknij")
            .setStyle(ButtonStyle.Primary)
        );

        const supportmsg = new EmbedBuilder()
          .setTitle(`${interaction.user.displayName}'s Ticket`)
          .setDescription(
            "**Witamy!**\nProszę podać szczegółowy opis swojego zapytania, a jeden z członków naszego zespołu wkrótce Ci pomoże."
          )
          .setFooter({ text: `User ID: ${interaction.user.id}` })
          .setColor("#cc5a4b");

        const premiummsg = new EmbedBuilder()
          .setTitle(`${interaction.user.displayName}'s Premium Ticket`)
          .setDescription(
            "**Witajcie!**\nPotrzebujesz pomocy dotyczącej naszego sklepu? Podziel się szczegółami swojego zapytania, a nasz zespół wkrótce się z Tobą skontaktuje. Twoja satysfakcja jest naszym priorytetem!"
          )
          .setFooter({ text: `User ID: ${interaction.user.id}` })
          .setColor("#cc5a4b");

        if (interaction.customId === "support") {
          const ticket = await interaction.guild.channels.create({
            name: `ticket ${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: supportcat,
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
            content: `<#${ticket.id}> has been made for you under General Support Category.`,
            ephemeral: true,
          });
          
client.channels.cache.get(log).send(`# New Ticket\n\n**User:** <@${interaction.user.id}> opened <#${ticket.id}> under General Support Category!`);
          ticket.send({
            content: `<@&${staffID}>\n**==========================**`,
            embeds: [supportmsg],
            components: [row2],
          });

          // Set cooldown for the user (2 hours in milliseconds)
          cooldowns.set(userId, currentTime + 2 * 60 * 60 * 1000);
        }

        if (interaction.customId === "premium") {
          const ticket = await interaction.guild.channels.create({
            name: `ticket ${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: premiumcat,
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
            content: `<#${ticket.id}> has been made for you under Premium Services Category.`,
            ephemeral: true,
          });
          
client.channels.cache.get(log).send(`# New Ticket\n\n**User:** <@${interaction.user.id}> opened <#${ticket.id}> under Premium Support Category!`);
          ticket.send({
            content: `<@&${staffID}>\n**==========================**`,
            embeds: [premiummsg],
            components: [row2],
          });

          // Set cooldown for the user (2 hours in milliseconds)
          cooldowns.set(userId, currentTime + 2 * 60 * 60 * 1000);
        }
      } else if (interaction.customId === "close") {
        // Check if the user has the whitelisted role
        const guild = interaction.guild;
        const member = guild.members.cache.get(userId);

        if (!member.roles.cache.has(whitelistrole)) {
          // User is not whitelisted, send an ephemeral message
          interaction.reply({
            content: "You are not whitelisted to perform this action.",
            ephemeral: true,
          });
          return;
        }

        const deleteButton = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setLabel("🗑️ Delete")
              .setCustomId("delete")
              .setStyle(ButtonStyle.Danger)
          );

        const close2Button = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setLabel("🔒 Close")
              .setCustomId("close2")
              .setStyle(ButtonStyle.Primary)
          );

        interaction.update({ content: `<@${interaction.user.id}> **Please click on either of the following button.**`, components: [deleteButton, close2Button] });
      } else if (interaction.customId === "delete") {
        // Delete the channel
        const channel = interaction.channel;
        channel.delete()
          .then(() => {
            interaction.reply("Ticket channel deleted.");
            client.channels.cache.get(log).send(`# Ticket Deleted\n\n**User:** <@${interaction.user.id}> deleted a ticket.`);
          })
          .catch(console.error);
      } else if (interaction.customId === "close2") {
        interaction.channel.permissionOverwrites.set([
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          }
        ]);
        interaction.reply(`<@${interaction.user.id}> closed the ticket.`);
  client.channels.cache.get(log).send(`# Ticket Closed\n\n**User:** <@${interaction.user.id}> closed a ticket.`);
      }
    }
  } catch (e) {
    console.log(e);
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  if (message.content.toLowerCase() === `!setup`) {
    // Create General Tickets category
    const generalTicketsCategory = await message.guild.channels.create({
      name: 'General Tickets',
      type: ChannelType.GuildCategory,
    });

    // Create Premium Tickets category
    const premiumTicketsCategory = await message.guild.channels.create({
      name: 'Premium Tickets',
      type: ChannelType.GuildCategory,
    });

    // Create Ticket Logs category
    const ticketLogsCategory = await message.guild.channels.create({
      name: 'Logs', 
      type: ChannelType.GuildCategory,
    });

    // Create a channel inside Ticket Logs category named 'ticket-logs'
    const ticket = await message.guild.channels.create({
      name: `ticket logs`,
      type: ChannelType.GuildText,
      parent: ticketLogsCategory,
      permissionOverwrites: [
        {
          id: message.author.id,
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
          id: message.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
      ],
      });

    // Reply to the user in the channel where the command was received
    message.channel.send('Ticket setup completed!');
  }
});

client.login(process.env.TOKEN);

