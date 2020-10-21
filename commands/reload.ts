import { Command } from "../command";
import importFresh from 'import-fresh';
import Bot from "../bot";
import TemplateCommand from "./template";

class ReloadCmd extends Command {

  get help() { return Strings.getHelp(); }


  constructor(bot: Bot) { super(['reload', 'rel', 'rld'], Bot.Role.Admin, bot); }


  _instructions(userArg: string) {
    const commands = this._bot.commands;
    const cmdIndex = commands.findIndex(cmd => cmd.aliases.includes(userArg))
    ;
    if (this._isReloadingSpecialCmd(userArg)) return
    ;
    if (!~cmdIndex) return (
      this._bot.sendMedMsg(
        Strings.getInvalidCommand(userArg),
        'Reload Error'
      )
    );
    commands[cmdIndex] =
      new (importFresh(`./${commands[cmdIndex].aliases[0]}.js`) as typeof TemplateCommand)(this._bot)
    ;
    this._bot.sendLowMsg(`\`;${userArg}\` command reloaded!`);
  }

  private _isReloadingSpecialCmd(userArg: string) {
    if (userArg == '+bot') {
      this._bot.reset();
      return true;
    }
    return false;
  }

}



namespace Strings {
  export const getHelp = () => (
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

  export const getInvalidCommand = (arg: string) => (
`\`${arg}\` is not a valid command. Did you spell it incorrectly?`
  );
}
export = ReloadCmd;