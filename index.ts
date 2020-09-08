import Discord from 'discord.js';
import importFresh from 'import-fresh';
import CommandHandler from './command-handler';
import DefineCmd from './commands/define';
import PingCmd from './commands/ping';
import ReloadCmd from './commands/reload';
import TestCmd from './commands/test';
import { MessagePriority, setMessage } from './utils';
import config from './config.json';

const client = new Discord.Client();

client.once('ready', () => {
	console.log('Ready!');
});
// const blah = `Officia dolore *duis* veniam ea Lorem cillum occaecat sint ex exercitation dolore sit id. Ex amet anim sint proident laborum incididunt dolore culpa nisi mollit proident dolor amet anim. Et consectetur laboris minim ullamco.

// **Might be good enough for a title**
// Officia id minim consectetur proident. In anim voluptate qui ullamco velit. Irure nisi laboris non Lorem eu fugiat laborum aliqua aliqua voluptate. Ut magna dolor sunt dolor ullamco excepteur elit aute irure commodo proident. Qui incididunt voluptate laborum exercitation non ea ad aute dolore nisi amet quis laborum.

// Enim dolor nulla pariatur in officia velit deserunt sint ipsum dolore aliquip amet deserunt eu. Dolore elit officia id laboris qui est pariatur deserunt velit. Est dolor ullamco voluptate pariatur aute nostrud excepteur tempor. Exercitation non cillum adipisicing sunt aute dolore cillum Lorem.`



function getCommands() {
  const Ping   = importFresh('./commands/ping.js')   as typeof PingCmd;
  const Reload = importFresh('./commands/reload.js') as typeof ReloadCmd;
  const Test   = importFresh('./commands/test.js')   as typeof TestCmd;
  const Define = importFresh('./commands/define.js') as typeof DefineCmd;
  return [
    new Ping(),
    new Reload(),
    new Test(),
    new Define(),
  ]
}

let cmdHandler = new CommandHandler(getCommands());

client.on('message', msg => {
  if (msg.channel.name == 'test-channel' || msg.channel.name == 'test') {
    if (msg.content == ';reload') {
      const Handler = importFresh('./command-handler.js') as typeof CommandHandler;
      cmdHandler = new Handler(getCommands());
      msg.channel.send(setMessage('All Commands Reloaded', MessagePriority.MEDIUM))
      return;
    }
    cmdHandler.find(msg);
  }

});

client.login(config.apiKeys.discord);