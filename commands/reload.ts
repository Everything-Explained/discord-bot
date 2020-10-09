import { Command } from "../command";
import importFresh from 'import-fresh';
import Bot from "../bot";
import TemplateCommand from "./template";

class ReloadCmd extends Command {

  get help() {
    return (
`**Reloading a Command**
This allows for the reloading of any \`<cmdname>\` by an
Admin, in cases where a command stops working or is updated.
\`\`\`;reload <cmdname>\`\`\`
**Plus Ultra Reloading**
The bot itself can also be reloaded with a very special sub-cmd
made just for it. *This sub-cmd should only be used in case the
bot is* **stuck in a persistent fail state**.

The commands are very compartmentalized so this should be a very
rare case where the bot-code itself is failing, independent from
commands.
\`\`\`;reload +bot\`\`\``
    );
  }


  constructor(bot: Bot) { super(['reload', 'rel', 'rld'], Bot.Role.Admin, bot); }


  _instructions(cmd: string) {
    const commands = this._bot.commands;
    const cmdIndex = commands.findIndex(c => c.aliases.includes(cmd))
    ;
    if (this._isReloadingSpecial(cmd)) return
    ;
    if (!~cmdIndex) return this._bot.sendMedMsg(
      `\`${cmd}\` is not a valid command. Did you spell it incorrectly?`,
      `Reload Error`
    );
    commands[cmdIndex] =
      new (importFresh(`./${commands[cmdIndex].aliases[0]}.js`) as typeof TemplateCommand)(this._bot)
    ;
    this._bot.sendLowMsg(`\`;${cmd}\` command reloaded!`);
  }


  private _isReloadingSpecial(cmd: string) {
    if (cmd == '+bot') {
      this._bot.reset();
      return true;
    }
    return false;
  }

}
export = ReloadCmd;