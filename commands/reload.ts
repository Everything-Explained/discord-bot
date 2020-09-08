import { Message } from "discord.js";
import { Command } from "../command";
import CommandHandler from "../command-handler";
import requireFresh from 'import-fresh';
import { setMessage } from "../utils";

class ReloadCmd extends Command {
  constructor() { super('reload'); }

  exec(handler: CommandHandler, msg: Message, reloadCmd: string) {
    const commands = handler.commands;
    for (let i = 0, l = commands.length; i < l; i++) {
      if (commands[i].name == reloadCmd) {
        const EditedCommand = requireFresh(`./${reloadCmd}.js`) as any;
        commands[i] = new EditedCommand();
        msg.channel.send(setMessage('Command Reloaded!'))
        return;
      }
    }
    msg.channel.send('Command Not Found.');
  }
}
export = ReloadCmd;