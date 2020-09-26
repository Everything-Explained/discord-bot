import { Command } from "../command";
import importFresh from 'import-fresh';
import Bot from "../bot";
import TemplateCommand from "./template";

class ReloadCmd extends Command {
  constructor(public bot: Bot) { super('reload', Bot.Role.Admin); }

  _instruction(cmd: string) {
    const commands = this.bot.commands;
    const cmdIndex = commands.findIndex(c => c.name == cmd)
    ;
    if (this._isReloadingSpecial(cmd)) return
    ;
    if (!~cmdIndex) return this.bot.sendMedMsg(
      `\`${cmd}\` is not a valid command. Did you spell it incorrectly?`,
      `Reload Error`
    );
    commands[cmdIndex] =
      new (importFresh(`./${cmd}.js`) as typeof TemplateCommand)(this.bot)
    ;
    this.bot.sendLowMsg(`\`;${cmd}\` command reloaded!`);
  }


  private _isReloadingSpecial(cmd: string) {
    if (cmd == '+bot') {
      this.bot.reset();
      return true;
    }
    return false;
  }
}
export = ReloadCmd;