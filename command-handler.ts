import { Message } from "discord.js";
import { Command } from "./command";
import { getMedMsg, MessagePriority, setMessage } from "./utils";





class CommandHandler {
  constructor(public commands: Command[]) {}


  find(msg: Message) {
    const cmdInfo = this._parseCommand(msg.content);
    if (!cmdInfo) return;
    const [cmdName, ...args] = cmdInfo;
    const cmd = this.commands.find(c => c.name == cmdName);
    if (!cmd) {
      msg.channel.send(
        getMedMsg('Command Not Found',
          'Make sure the command exists within the command list \
          and that you have the sufficient **Role** to access to the command.'
        )
      );
      return;
    }
    cmd.exec(this, msg, ...args);
  }

  private _parseCommand(input: string) {
    const args = input.trim().split(' ');
    const cmd = args.shift()!;
    if (cmd[0] != ';') return undefined;
    if (cmd.length < 4) return undefined;
    return [cmd.substr(1), ...args];
  }
}

export = CommandHandler;