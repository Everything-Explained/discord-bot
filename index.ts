import { Client } from 'discord.js';
import importFresh from 'import-fresh';
import Bot from './bot';
import sourcemap from 'source-map-support';

// Provide typescript file stack traces
sourcemap.install();



const client = new Client();
let bot = new Bot(client, resetBot);

function resetBot() {
  bot = new (importFresh('./bot.js') as typeof Bot)(client, resetBot, true);
}


// const client = new Discord.Client();

// client.once('ready', () => {
// 	console.log('Ready!');
// });


// function getCommands() {
//   const Ping   = importFresh('./commands/ping.js')   as typeof PingCmd;
//   const Reload = importFresh('./commands/reload.js') as typeof ReloadCmd;
//   const Test   = importFresh('./commands/test.js')   as typeof TestCmd;
//   const Define = importFresh('./commands/define.js') as typeof DefineCmd;
//   return [
//     new Ping(),
//     new Reload(),
//     new Test(),
//     new Define(),
//   ];
// }

// let cmdHandler = new CommandHandler(getCommands());

// client.on('message', msg => {
//   if (msg.channel.name == 'test-channel' || msg.channel.name == 'test') {
//     if (msg.content == ';reload') {
//       const Handler = importFresh('./command-handler.js') as typeof CommandHandler;
//       cmdHandler = new Handler(getCommands());
//       msg.channel.send(setMessage('All Commands Reloaded', MessagePriority.MEDIUM));
//       return;
//     }
//     cmdHandler.find(msg);
//   }

// });

// client.login(config.apiKeys.discord);