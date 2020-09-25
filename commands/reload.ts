import { Message } from "discord.js";
import { Command } from "../command";
import CommandHandler from "../command-handler";
import importFresh from 'import-fresh';
import Bot from "../bot";
import TemplateCommand from "./template";

class ReloadCmd extends Command {
  constructor(public bot: Bot) { super('reload', Bot.Role.Admin); }

  _instruction(handler: CommandHandler, msg: Message, cmd: string) {
    const commands = handler.commands;
    const cmdIndex = commands.findIndex(c => c.name == cmd)
    ;
    if (this._isReloadingSpecial(msg, cmd)) return
    ;
    if (!~cmdIndex) return void msg.channel.send(
      this.bot.setMedMsg(
        `\`${cmd}\` is not a valid command. Did you \
         spell it incorrectly?`,
        `Reload Error`
      )
    );
    commands[cmdIndex] =
      new (importFresh(`./${cmd}.js`) as typeof TemplateCommand)(this.bot)
    ;
    msg.channel.send(
      this.bot.setLowMsg(`\`;${cmd}\` command reloaded!`)
    );
  }


  private _isReloadingSpecial(msg: Message, cmd: string) {
    if (cmd == '+bot') {
      this.bot.reset(msg);
      return true;
    }
    return false;
  }
}
export = ReloadCmd;