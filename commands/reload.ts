import { Message } from "discord.js";
import { Command } from "../command";
import CommandHandler from "../command-handler";
import importFresh from 'import-fresh';
import { Bot, Role } from "../bot";
import TemplateCommand from "./template";

class ReloadCmd extends Command {
  constructor(public bot: Bot) { super('reload', Role.Admin); }

  _instruction(handler: CommandHandler, msg: Message, reloadCmd: string) {
    const commands = handler.commands;
    const cmdIndex = commands.findIndex(c => c.name == reloadCmd)
    ;
    if (!~cmdIndex) return void msg.channel.send(
      this.bot.setMedMsg(
        `\`${reloadCmd}\` is not a valid command. Did you \
         spell it incorrectly?`,
        `Reload Error`
      )
    );
    commands[cmdIndex] =
      new (importFresh(`./${reloadCmd}.js`) as typeof TemplateCommand)(this.bot)
    ;
    msg.channel.send(
      this.bot.setLowMsg(`\`;${reloadCmd}\` command reloaded!`)
    );
  }
}
export = ReloadCmd;