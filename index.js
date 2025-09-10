// index.js
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const db = require('./database');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });

const TOKEN = 'YOUR_DISCORD_BOT_TOKEN';
const GUILD_ID = 'YOUR_GUILD_ID';
const ROLE_ID = 'ROLE_ID_TO_GIVE';
const GAMEPASS_ID = 'YOUR_GAMEPASS_ID';

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  const args = message.content.split(' ');
  if (args[0] === '!link') {
    const robloxUsername = args[1];
    if (!robloxUsername) return message.reply('Please provide your Roblox username: `!link <username>`');

    try {
      // Get Roblox user ID
      const userRes = await axios.get(`https://api.roblox.com/users/get-by-username?username=${robloxUsername}`);
      const robloxId = userRes.data.Id;
      if (!robloxId) return message.reply('Roblox user not found.');

      // Check if Discord is already linked
      db.get('SELECT * FROM links WHERE discord_id = ?', [message.author.id], (err, row) => {
        if (row) return message.reply('Your Discord account is already linked to a Roblox account.');
        
        db.get('SELECT * FROM links WHERE roblox_id = ?', [robloxId], async (err, row2) => {
          if (row2) return message.reply('This Roblox account is already linked to another Discord account.');

          // Check game pass ownership
          const gpRes = await axios.get(`https://apis.roblox.com/game-passes/v1/game-passes/${GAMEPASS_ID}/owners?limit=100`);
          const owners = gpRes.data.data.map(x => x.userId);
          if (!owners.includes(robloxId)) return message.reply('You do not own the required game pass.');

          // Give role
          const guild = await client.guilds.fetch(GUILD_ID);
          const member = await guild.members.fetch(message.author.id);
          await member.roles.add(ROLE_ID);

          // Save link
          db.run('INSERT INTO links(discord_id, roblox_id) VALUES(?, ?)', [message.author.id, robloxId], () => {
            message.reply('Successfully linked your Roblox account and gave the role!');
          });
        });
      });
    } catch (err) {
      console.error(err);
      message.reply('An error occurred while linking your account.');
    }
  }
});

client.login(MTQxNTQyODgwMTY4MDM3NTg2OQ.Ghq2qx.7mFQTXVfj99BX705lXL5zWSj2CdMqQRJiRwuWw);
